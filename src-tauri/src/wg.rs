use rand_core::OsRng;
use serde::Serialize;
use std::{fmt, include_str, str};
use thiserror::Error;
use tinytemplate::{error::Error as TinyTemplateError, TinyTemplate};
use x25519_dalek::{PublicKey, StaticSecret};

static TEMPLATE: &'static str = include_str!("./wg-config");

#[derive(Error, Debug)]
pub enum WgError {
    #[error("template error")]
    Template(#[from] TinyTemplateError),
}

#[derive(Serialize)]
pub struct Wireguard {
    secret: StaticSecret,
    public: PublicKey,
}

#[derive(Serialize)]
struct TemplateContext {
    secret_key: String,
}

impl Wireguard {
    pub fn new() -> Self {
        let secret = StaticSecret::new(OsRng);
        let public = PublicKey::from(&secret);

        Self { secret, public }
    }

    pub fn secret_encoded(&self) -> String {
        base64::encode(self.secret.to_bytes())
    }

    pub fn public_encoded(&self) -> String {
        base64::encode(self.public.to_bytes())
    }

    pub fn wg_config(&self) -> Result<String, WgError> {
        let mut tt = TinyTemplate::new();
        tt.add_template("hello", TEMPLATE)?;

        let context = TemplateContext {
            secret_key: self.secret_encoded(),
        };

        let rendered = tt.render("hello", &context)?;

        Ok(rendered)
    }
}

impl fmt::Debug for Wireguard {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("Wireguard")
            .field("secret", &self.secret_encoded())
            .field("public", &self.public_encoded())
            .finish()
    }
}
