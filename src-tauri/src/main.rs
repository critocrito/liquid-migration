#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use serde::Serialize;
use std::{fs, io::ErrorKind};
use tauri::State;

mod cfg;
mod cmd;
mod templates;
mod wg;

#[derive(Debug, Serialize)]
#[serde(tag = "type")]
enum UnameMessage {
    #[serde(rename = "success")]
    Uname { uname: String },
    #[serde(rename = "error")]
    CommandError { message: String },
}

#[derive(Debug, Serialize)]
#[serde(tag = "type")]
enum AppConfigMessage {
    #[serde(rename = "success")]
    AppConfig {
        #[serde(flatten)]
        cfg: cfg::AppConfig,
    },
}

#[derive(Debug, Serialize)]
#[serde(tag = "type")]
enum HostSetupMessage {
    #[serde(rename = "success")]
    Setup,
    #[serde(rename = "waiting")]
    Poll,
    #[serde(rename = "error")]
    CommandError { message: String },
}

#[derive(Debug, Serialize)]
#[serde(tag = "type")]
enum WireguardMessage {
    #[serde(rename = "success")]
    WireguardConfig {
        public_key: String,
        private_key: String,
    },
}

#[derive(Debug, Serialize)]
#[serde(tag = "type")]
enum TemplateMessage {
    #[serde(rename = "success")]
    Template,
    #[serde(rename = "error")]
    CommandError { message: String },
}

#[tauri::command]
fn wg_keys(cfg: State<AppState>) -> WireguardMessage {
    let wireguard = wg::Wireguard::new();

    WireguardMessage::WireguardConfig {
        public_key: wireguard.public_encoded(),
        private_key: wireguard.secret_encoded(),
    }
}

#[tauri::command]
fn templates(pubkey: &str, privkey: &str, state: State<AppState>) -> TemplateMessage {
    let wg_template = match templates::wg_config(
        privkey,
        &state.cfg.vpn_server.public_key,
        &state.cfg.vpn_server.host,
        &state.cfg.vpn_server.endpoint,
        &state.cfg.vpn_server.network,
    ) {
        Ok(tmpl) => tmpl,
        Err(e) => {
            return TemplateMessage::CommandError {
                message: e.to_string(),
            }
        }
    };

    let ferm_template = match templates::ferm_patch(&state.cfg.vpn_server.endpoint) {
        Ok(tmpl) => tmpl,
        Err(e) => {
            return TemplateMessage::CommandError {
                message: e.to_string(),
            }
        }
    };

    let browser_template = match templates::browser_patch(&state.cfg.vpn_server.endpoint) {
        Ok(tmpl) => tmpl,
        Err(e) => {
            return TemplateMessage::CommandError {
                message: e.to_string(),
            }
        }
    };

    match fs::create_dir(&state.cfg.client.cfg_dir) {
        _ => {}
        Err(e) => {
            if e.kind() != ErrorKind::AlreadyExists {
                let msg = e.to_string();
                return TemplateMessage::CommandError { message: msg };
            }
        }
    };

    let mut wg_template_path = state.cfg.client.cfg_dir.clone();
    let mut ferm_template_path = state.cfg.client.cfg_dir.clone();
    let mut browser_template_path = state.cfg.client.cfg_dir.clone();
    let mut privkey_path = state.cfg.client.cfg_dir.clone();
    let mut pubkey_path = state.cfg.client.cfg_dir.clone();

    wg_template_path.push("wg0.conf");
    ferm_template_path.push("ferm.conf.patch");
    browser_template_path.push("unsafe-browser.patch");
    privkey_path.push("privkey");
    pubkey_path.push("pubkey");

    fs::write(wg_template_path, &wg_template).expect("Couldn't write wg0.conf");
    fs::write(ferm_template_path, &ferm_template).expect("Couldn't write ferm.conf.patch");
    fs::write(browser_template_path, &browser_template)
        .expect("Couldn't write unsafe-browser.patch");
    fs::write(privkey_path, &privkey).expect("Couldn't write privkey");
    fs::write(pubkey_path, &pubkey).expect("Couldn't write pubkey");

    TemplateMessage::Template
}

#[tauri::command]
fn uname(password: &str) -> UnameMessage {
    match cmd::setup_vpn(password) {
        Ok(msg) => UnameMessage::Uname { uname: msg },
        Err(e) => UnameMessage::CommandError {
            message: e.to_string(),
        },
    }
}

#[tauri::command]
fn app_config(state: State<AppState>) -> AppConfigMessage {
    AppConfigMessage::AppConfig {
        cfg: state.cfg.clone(),
    }
}

#[tauri::command]
fn host_setup() -> HostSetupMessage {
    match cmd::verify_wireguard_pkg() {
        Ok(_) => HostSetupMessage::Setup,
        Err(_) => HostSetupMessage::Poll,
    }
}

#[derive(Debug)]
struct AppState {
    cfg: cfg::AppConfig,
}

impl AppState {
    fn new() -> Self {
        Self {
            cfg: (*cfg::APP_CONFIG).clone(),
        }
    }
}

fn main() {
    tauri::Builder::default()
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            wg_keys, uname, app_config, host_setup, templates
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
