#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use serde::Serialize;
use std::{fs, io::ErrorKind, path::Path};
use tauri::State;

mod cfg;
mod cmd;
mod templates;
mod wg;

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

#[derive(Debug, Serialize)]
#[serde(tag = "type")]
enum PatchSystemMessage {
    #[serde(rename = "success")]
    Patched,
    #[serde(rename = "error")]
    CommandError { message: String },
}

#[tauri::command]
fn wg_keys() -> WireguardMessage {
    let wireguard = wg::Wireguard::new();

    WireguardMessage::WireguardConfig {
        public_key: wireguard.public_encoded(),
        private_key: wireguard.secret_encoded(),
    }
}

#[tauri::command]
fn templates(pubkey: &str, privkey: &str, ipaddr: &str, state: State<AppState>) -> TemplateMessage {
    let wg_template = match templates::wg_config(
        privkey,
        &state.cfg.server.public_key,
        &state.cfg.server.host,
        &state.cfg.server.endpoint,
        &state.cfg.server.network,
        ipaddr,
    ) {
        Ok(tmpl) => tmpl,
        Err(e) => {
            return TemplateMessage::CommandError {
                message: e.to_string(),
            }
        }
    };

    let ferm_template = match templates::ferm_patch(&state.cfg.server.endpoint) {
        Ok(tmpl) => tmpl,
        Err(e) => {
            return TemplateMessage::CommandError {
                message: e.to_string(),
            }
        }
    };

    let browser_template = match templates::browser_patch(&state.cfg.server.endpoint) {
        Ok(tmpl) => tmpl,
        Err(e) => {
            return TemplateMessage::CommandError {
                message: e.to_string(),
            }
        }
    };

    if let Err(e) = fs::create_dir(&state.cfg.client.cfg_dir) {
        if e.kind() != ErrorKind::AlreadyExists {
            let msg = e.to_string();
            return TemplateMessage::CommandError { message: msg };
        }
    };

    let wg_template_path = Path::new(&state.cfg.client.cfg_dir).join("wg0.conf");
    let ferm_template_path = Path::new(&state.cfg.client.cfg_dir).join("ferm.conf.patch");
    let browser_template_path = Path::new(&state.cfg.client.cfg_dir).join("unsafe-browser.patch");
    let privkey_path = Path::new(&state.cfg.client.cfg_dir).join("privkey");
    let pubkey_path = Path::new(&state.cfg.client.cfg_dir).join("pubkey");
    let ipaddr_path = Path::new(&state.cfg.client.cfg_dir).join("ipaddr");

    fs::write(wg_template_path, wg_template).expect("Couldn't write wg0.conf");
    fs::write(ferm_template_path, ferm_template).expect("Couldn't write ferm.conf.patch");
    fs::write(browser_template_path, browser_template)
        .expect("Couldn't write unsafe-browser.patch");
    fs::write(privkey_path, privkey).expect("Couldn't write privkey");
    fs::write(pubkey_path, pubkey).expect("Couldn't write pubkey");
    fs::write(ipaddr_path, ipaddr).expect("Couldn't write ipaddr");

    TemplateMessage::Template
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

#[tauri::command]
fn patch_system(password: &str, state: State<AppState>) -> PatchSystemMessage {
    let wg_conf_path = Path::new(&state.cfg.client.cfg_dir).join("wg0.conf");
    let ferm_patch_path = Path::new(&state.cfg.client.cfg_dir).join("ferm.conf.patch");
    let browser_patch_path = Path::new(&state.cfg.client.cfg_dir).join("unsafe-browser.patch");

    if cmd::test_sudo(password).is_err() {
        return PatchSystemMessage::CommandError {
            message: "Administrator password failed.".to_string(),
        };
    }

    if let Err(e) = cmd::sudo_patch_file(
        password,
        &ferm_patch_path.to_string_lossy(),
        &state.cfg.client.ferm_config,
    ) {
        return PatchSystemMessage::CommandError {
            message: e.to_string(),
        };
    }

    if let Err(e) = cmd::sudo_patch_file(
        password,
        &browser_patch_path.to_string_lossy(),
        &state.cfg.client.unsafe_browser,
    ) {
        return PatchSystemMessage::CommandError {
            message: e.to_string(),
        };
    }

    if let Err(e) = cmd::sudo_copy_file(
        password,
        &wg_conf_path.to_string_lossy(),
        &state.cfg.client.wg_config,
    ) {
        return PatchSystemMessage::CommandError {
            message: e.to_string(),
        };
    }

    PatchSystemMessage::Patched
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
            wg_keys,
            app_config,
            host_setup,
            templates,
            patch_system
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
