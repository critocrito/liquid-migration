use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};

const CFG_JSON: &str = include_str!("../../resources/app-config.json");

fn default_port() -> String {
    "51820".to_string()
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
    pub(crate) host: std::net::Ipv4Addr,
    pub(crate) endpoint: std::net::Ipv4Addr,
    #[serde(default = "default_port")]
    pub(crate) port: String,
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
