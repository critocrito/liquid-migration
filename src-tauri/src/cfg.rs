use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::{
    fs,
    net::{AddrParseError, Ipv4Addr},
    path::Path,
};
use thiserror::Error;

const CFG_JSON: &str = include_str!("../../resources/app-config.json");

#[derive(Debug, Error)]
pub(crate) enum AppCfgError {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error("failed to parse config value: {0}")]
    Parse(String),
}

impl From<AddrParseError> for AppCfgError {
    fn from(e: AddrParseError) -> Self {
        AppCfgError::Parse(e.to_string())
    }
}

fn default_port() -> String {
    "51820".to_string()
}

fn default_servername() -> String {
    "liquidvpn".to_string()
}

fn default_ferm() -> String {
    "/etc/ferm/ferm.conf".to_string()
}

fn default_wg() -> String {
    "/etc/wireguard/wg0.conf".to_string()
}

fn default_unsafe_browser() -> String {
    "/usr/local/sbin/unsafe-browser".to_string()
}

fn default_cfg_dir() -> String {
    "/home/amnesia/Persistent/.liquid".to_string()
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub(crate) struct Server {
    pub(crate) host: Ipv4Addr,
    pub(crate) endpoint: Ipv4Addr,
    #[serde(default = "default_port")]
    pub(crate) port: String,
    #[serde(default = "default_servername")]
    pub(crate) servername: String,
    pub(crate) public_key: String,
    pub(crate) network: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub(crate) struct Client {
    #[serde(default = "default_ferm")]
    pub(crate) ferm_config: String,
    #[serde(default = "default_wg")]
    pub(crate) wg_config: String,
    #[serde(default = "default_unsafe_browser")]
    pub(crate) unsafe_browser: String,
    #[serde(default = "default_cfg_dir")]
    pub(crate) cfg_dir: String,
}

impl Default for Client {
    fn default() -> Self {
        Self {
            ferm_config: default_ferm(),
            wg_config: default_wg(),
            unsafe_browser: default_unsafe_browser(),
            cfg_dir: default_cfg_dir(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub(crate) struct AppConfig {
    pub(crate) project: String,
    pub(crate) server: Server,
    #[serde(default)]
    pub(crate) client: Client,
}

lazy_static! {
    pub(crate) static ref APP_CONFIG: AppConfig = serde_json::from_str(CFG_JSON).unwrap();
}

pub(crate) fn cached_ipaddr(cfg_dir: &str) -> Result<std::net::Ipv4Addr, AppCfgError> {
    let ipaddr_path = Path::new(cfg_dir).join("ipaddr");
    let ipaddr_file = fs::read(ipaddr_path)?;

    Ok(String::from_utf8_lossy(&ipaddr_file).parse::<Ipv4Addr>()?)
}
