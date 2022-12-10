use clap::Parser;
use rand_core::OsRng;
use serde::Serialize;
use std::{include_str, str};
use tinytemplate::TinyTemplate;
use x25519_dalek::{PublicKey, StaticSecret};

static TEMPLATE: &'static str = include_str!("./wg-config");

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {}

#[derive(Serialize)]
struct WireguardKeys {
    secret: StaticSecret,
    public: PublicKey,
}

#[derive(Serialize)]
struct Context {
    secret_key: String,
}

impl WireguardKeys {
    fn new() -> Self {
        let secret = StaticSecret::new(OsRng);
        let public = PublicKey::from(&secret);

        Self { secret, public }
    }

    fn secret_encoded(&self) -> String {
        base64::encode(self.secret.to_bytes())
    }

    fn public_encoded(&self) -> String {
        base64::encode(self.public.to_bytes())
    }
}

fn main() {
    let args = Args::parse();

    let keys = WireguardKeys::new();
    println!("{:?}", keys.secret_encoded());
    println!("{:?}", keys.public_encoded());

    let mut tt = TinyTemplate::new();
    tt.add_template("hello", TEMPLATE).unwrap();

    let context = Context {
        secret_key: keys.secret_encoded(),
    };

    let rendered = tt.render("hello", &context).unwrap();
    println!("{}", rendered);
}
