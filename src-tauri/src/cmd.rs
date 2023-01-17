use std::{
    io::{Error as IoError, Write},
    path::Path,
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

#[cfg(target_os = "linux")]
pub(crate) fn verify_wireguard_pkg() -> Result<(), CmdError> {
    let mut child = Command::new("dpkg")
        .arg("-s")
        .arg("wireguard")
        .spawn()
        .expect("failed to spawn");

    let _ = child.wait()?;

    Ok(())
}

#[cfg(target_os = "macos")]
pub(crate) fn verify_wireguard_pkg() -> Result<(), CmdError> {
    // Err(CmdError::Sudo("Boom!".to_string()))
    std::thread::sleep(std::time::Duration::from_millis(3000));
    Ok(())
}

pub(crate) fn sudo_patch_file(
    password: &str,
    patch: &str,
    target: &str,
) -> Result<String, CmdError> {
    let mut child = Command::new("sudo")
        .arg("-S")
        .arg("-k")
        .arg("patch")
        .arg(target)
        .arg(patch)
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

pub(crate) fn sudo_mkdirp(password: &str, target: &str) -> Result<String, CmdError> {
    let target_path = Path::new(target);

    let mut child = Command::new("sudo")
        .arg("-S")
        .arg("-k")
        .arg("mkdir")
        .arg("-p")
        .arg(target_path.file_stem().unwrap())
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

pub(crate) fn sudo_copy_file(
    password: &str,
    source: &str,
    target: &str,
) -> Result<String, CmdError> {
    sudo_mkdirp(&password, &target)?;

    let mut child = Command::new("sudo")
        .arg("-S")
        .arg("-k")
        .arg("cp")
        .arg(source)
        .arg(target)
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
