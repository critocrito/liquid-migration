use serde::Serialize;
use std::{include_str, net::Ipv4Addr, str};
use thiserror::Error;
use tinytemplate::{error::Error as TinyTemplateError, TinyTemplate};

static WG_TEMPLATE: &str = include_str!("./wg-config");
static FERM_TEMPLATE: &str = include_str!("./ferm.conf.patch");
static BROWSER_TEMPLATE: &str = include_str!("./unsafe-browser.patch");

#[derive(Error, Debug)]
pub enum TemplateError {
    #[error(transparent)]
    Template(#[from] TinyTemplateError),
}

#[derive(Serialize)]
struct WgTemplateContext {
    secret_key: String,
    public_key: String,
    network: String,
    host: String,
    endpoint: String,
    ipaddr: String,
}

#[derive(Serialize)]
struct FermTemplateContext {
    endpoint: String,
}

#[derive(Serialize)]
struct BrowserTemplateContext {
    host: String,
}

pub fn wg_config(
    secret_key: &str,
    public_key: &str,
    host: &Ipv4Addr,
    endpoint: &Ipv4Addr,
    network: &str,
    ipaddr: &str,
) -> Result<String, TemplateError> {
    let mut tt = TinyTemplate::new();
    tt.add_template("hello", WG_TEMPLATE)?;

    let context = WgTemplateContext {
        secret_key: secret_key.to_string(),
        public_key: public_key.to_string(),
        host: host.to_string(),
        endpoint: endpoint.to_string(),
        network: network.to_string(),
        ipaddr: ipaddr.to_string(),
    };

    let rendered = tt.render("hello", &context)?;

    Ok(rendered)
}

pub fn ferm_patch(endpoint: &Ipv4Addr) -> Result<String, TemplateError> {
    let mut tt = TinyTemplate::new();
    tt.add_template("hello", FERM_TEMPLATE)?;

    let context = FermTemplateContext {
        endpoint: endpoint.to_string(),
    };

    let rendered = tt.render("hello", &context)?;

    Ok(rendered)
}

pub fn browser_patch(host: &Ipv4Addr) -> Result<String, TemplateError> {
    let mut tt = TinyTemplate::new();
    tt.add_template("hello", BROWSER_TEMPLATE)?;

    let context = BrowserTemplateContext {
        host: host.to_string(),
    };

    let rendered = tt.render("hello", &context)?;

    Ok(rendered)
}
