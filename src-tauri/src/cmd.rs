use std::{
    io::{Error as IoError, Write},
    process::{Command, Stdio},
    str,
};
use thiserror::Error;

#[derive(Error, Debug)]
pub(crate) enum CmdError {
    #[error("io error")]
    Io(#[from] IoError),
    #[error("{0}")]
    Sudo(String),
}

pub(crate) fn test_sudo(password: &str) -> Result<(), CmdError> {
    let mut child = Command::new("sudo")
        .arg("-S")
        .arg("-k")
        .arg("-l")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()?;

    let child_stdin = child.stdin.as_mut();
    if let Some(stdin) = child_stdin {
        stdin.write_all(password.as_bytes())?;
        stdin.write_all(b"\n")?;
    }

    let output = child.wait_with_output()?;

    if output.status.success() {
        Ok(())
    } else {
        Err(CmdError::Sudo("Password failed.".to_string()))
    }
}

pub(crate) fn sudo_uname(password: &str) -> Result<String, CmdError> {
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
        stdin.write_all(password.as_bytes())?;
        stdin.write_all(b"\n")?;
    }

    let output = child.wait_with_output()?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(CmdError::Sudo(
            String::from_utf8_lossy(&output.stderr).to_string(),
        ))
    }
}

pub(crate) fn setup_vpn(password: &str) -> Result<String, CmdError> {
    test_sudo(&password)?;
    let uname = sudo_uname(&password)?;
    Ok(uname)
}
