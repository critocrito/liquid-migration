use rand_core::OsRng;
use serde::Serialize;
use std::fmt;
use x25519_dalek::{PublicKey, StaticSecret};

#[derive(Serialize)]
pub struct Wireguard {
    secret: StaticSecret,
    public: PublicKey,
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
}

impl fmt::Debug for Wireguard {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("Wireguard")
            .field("secret", &self.secret_encoded())
            .field("public", &self.public_encoded())
            .finish()
    }
}
