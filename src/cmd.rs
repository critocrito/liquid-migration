use lazy_async_promise::ImmediateValuePromise;
use std::{io::Error as IoError, process::Stdio, str};
use thiserror::Error;
use tokio::{io::AsyncWriteExt, process::Command};

#[derive(Error, Debug)]
pub(crate) enum CmdError {
    #[error("io error")]
    Io(#[from] IoError),
    #[error("{0}")]
    Sudo(String),
}

pub(crate) async fn test_sudo(password: &str) -> std::result::Result<(), CmdError> {
    let mut child = Command::new("sudo")
        .arg("-S")
        .arg("-k")
        .arg("-l")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()?;

    let child_stdin = child.stdin.as_mut();
    if let Some(stdin) = child_stdin {
        stdin.write_all(password.as_bytes()).await?;
        stdin.write_all(b"\n").await?;
    }

    let output = child.wait_with_output().await?;

    if output.status.success() {
        Ok(())
    } else {
        Err(CmdError::Sudo("Password failed.".to_string()))
    }
}

pub(crate) async fn sudo_uname(password: &str) -> std::result::Result<String, CmdError> {
    let mut child = Command::new("sudo")
        .arg("-S")
        .arg("-k")
        .arg("uname")
        .arg("-a")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()?;

    let child_stdin = child.stdin.as_mut();
    if let Some(stdin) = child_stdin {
        stdin.write_all(password.as_bytes()).await?;
        stdin.write_all(b"\n").await?;
    }

    let output = child.wait_with_output().await?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(CmdError::Sudo(
            String::from_utf8_lossy(&output.stderr).to_string(),
        ))
    }
}

pub fn setup_vpn(password: String) -> ImmediateValuePromise<()> {
    ImmediateValuePromise::new(async move {
        test_sudo(&password).await?;
        sudo_uname(&password).await?;
        Ok(())
    })
}
