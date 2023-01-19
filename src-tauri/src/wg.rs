use rand_core::OsRng;
use serde::Serialize;
use std::{fmt, fs, path::Path};
use thiserror::Error;
use x25519_dalek::{PublicKey, StaticSecret};

#[derive(Debug, Error)]
pub enum WgError {
    #[error(transparent)]
    Decode(#[from] base64::DecodeError),
    #[error("parsing key from string")]
    Parse,
    #[error(transparent)]
    Io(#[from] std::io::Error),
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

    pub fn from_path(dir: &str) -> Result<Self, WgError> {
        let pubkey_path = Path::new(&dir).join("pubkey");
        let pubkey_file = fs::read(pubkey_path)?;
        let pubkey = String::from_utf8_lossy(&pubkey_file);

        let privkey_path = Path::new(&dir).join("privkey");
        let privkey_file = fs::read(privkey_path)?;
        let privkey = String::from_utf8_lossy(&privkey_file);

        Ok(Wireguard::from_encoded(&privkey, &pubkey)?)
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
    fn generate_new_keys() {
        let wg = Wireguard::new();

        let pubkey = wg.public_encoded();
        let privkey = wg.secret_encoded();

        assert_eq!(pubkey.len(), 44);
        assert_eq!(privkey.len(), 44);
    }

    #[test]
    fn restore_keys_from_string() {
        let privkey = "IB+p0pBDrhJvehQHuIzRu0Go5dzAk2ad+Cx6ayNjCFI=";
        let pubkey = "Y7rK8JM7kW3eqhOa7Ei5TMwA+yHCYy51g5A1+2HIemw=";

        let wg = Wireguard::from_encoded(&privkey, pubkey).unwrap();

        assert_eq!(wg.secret_encoded(), privkey);
        assert_eq!(wg.public_encoded(), pubkey);
    }
}
