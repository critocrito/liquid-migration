#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use serde::Serialize;

mod cfg;
mod cmd;
mod wg;

#[derive(Debug, Serialize)]
#[serde(tag = "type")]
enum WireguardMessage {
    #[serde(rename = "success")]
    WireguardConfig {
        public_key: String,
        private_key: String,
        config_file: String,
    },
    #[serde(rename = "error")]
    CommandError { message: String },
}

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

#[tauri::command]
fn wg_config() -> WireguardMessage {
    let wireguard = wg::Wireguard::new();

    match wireguard.wg_config() {
        Ok(cfg) => WireguardMessage::WireguardConfig {
            public_key: wireguard.public_encoded(),
            private_key: wireguard.secret_encoded(),
            config_file: cfg,
        },
        Err(e) => WireguardMessage::CommandError {
            message: e.to_string(),
        },
    }
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
fn app_config() -> AppConfigMessage {
    AppConfigMessage::AppConfig {
        cfg: (*cfg::APP_CONFIG).clone(),
    }
}

#[tauri::command]
fn host_setup() -> HostSetupMessage {
    match cmd::verify_wireguard_pkg() {
        Ok(_) => HostSetupMessage::Setup,
        Err(_) => HostSetupMessage::Poll,
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            wg_config, uname, app_config, host_setup
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
