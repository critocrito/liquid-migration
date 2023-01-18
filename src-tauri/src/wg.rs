use rand_core::OsRng;
use serde::Serialize;
use std::fmt;
use thiserror::Error;
use x25519_dalek::{PublicKey, StaticSecret};

#[derive(Debug, Error)]
pub enum WgError {
    #[error(transparent)]
    Decode(#[from] base64::DecodeError),
    #[error("parsing key from string")]
    Parse,
}

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

    pub fn from_encoded(privkey: &str, pubkey: &str) -> Result<Self, WgError> {
        let privkey_decoded = base64::decode(privkey)?;
        let pubkey_decoded = base64::decode(pubkey)?;

        let privkey: &[u8; 32] = privkey_decoded
            .as_slice()
            .try_into()
            .map_err(|_| WgError::Parse)?;
        let pubkey: &[u8; 32] = pubkey_decoded
            .as_slice()
            .try_into()
            .map_err(|_| WgError::Parse)?;

        Ok(Self {
            secret: StaticSecret::from(privkey.to_owned()),
            public: PublicKey::from(pubkey.to_owned()),
        })
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn restore_keys_from_string() {
        let privkey = "IB+p0pBDrhJvehQHuIzRu0Go5dzAk2ad+Cx6ayNjCFI=";
        let pubkey = "Y7rK8JM7kW3eqhOa7Ei5TMwA+yHCYy51g5A1+2HIemw=";

        let wg = Wireguard::from_encoded(&privkey, pubkey).unwrap();

        assert_eq!(wg.secret_encoded(), privkey);
        assert_eq!(wg.public_encoded(), pubkey);
    }
}
