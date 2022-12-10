use anyhow::Result;
use eframe::egui;
use rand_core::OsRng;
use serde::Serialize;
use std::{
    include_str,
    io::{Error as IoError, Write},
    process::{Command, Stdio},
    str,
};
use thiserror::Error;
use tinytemplate::TinyTemplate;
use x25519_dalek::{PublicKey, StaticSecret};

static TEMPLATE: &'static str = include_str!("./wg-config");

#[derive(Error, Debug)]
enum AppError {
    #[error("command error")]
    Command(#[from] IoError),
    #[error("{0}")]
    Sudo(String),
}

#[derive(Serialize)]
struct Wireguard {
    secret: StaticSecret,
    public: PublicKey,
}

#[derive(Serialize)]
struct TemplateContext {
    secret_key: String,
}

impl Wireguard {
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

    fn wg_config(&self) -> Result<String> {
        let mut tt = TinyTemplate::new();
        tt.add_template("hello", TEMPLATE)?;

        let context = TemplateContext {
            secret_key: self.secret_encoded(),
        };

        let rendered = tt.render("hello", &context)?;

        Ok(rendered)
    }
}

fn test_sudo(password: &str) -> std::result::Result<(), AppError> {
    let mut child = Command::new("sudo")
        .arg("-S")
        .arg("-k")
        .arg("-l")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()?;

    let child_stdin = child.stdin.as_mut().unwrap();
    child_stdin.write_all(password.as_bytes())?;
    child_stdin.write_all(b"\n")?;
    // Close stdin to finish and avoid indefinite blocking
    drop(child_stdin);

    let output = child.wait_with_output()?;

    if output.status.success() {
        Ok(())
    } else {
        Err(AppError::Sudo("Sudo password failed.".to_string()))
    }
}

fn sudo_uname(password: &str) -> std::result::Result<String, AppError> {
    let mut child = Command::new("sudo")
        .arg("-S")
        .arg("-k")
        .arg("uname")
        .arg("-sdasd")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()?;

    let child_stdin = child.stdin.as_mut().unwrap();
    child_stdin.write_all(password.as_bytes())?;
    child_stdin.write_all(b"\n")?;
    // Close stdin to finish and avoid indefinite blocking
    drop(child_stdin);

    let output = child.wait_with_output()?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(AppError::Sudo(
            String::from_utf8_lossy(&output.stderr).to_string(),
        ))
    }
}

enum AppState {
    Wait,
    Done,
    Error(String),
}

struct MyApp {
    state: AppState,
    sudo_password: String,
    wireguard: Option<Wireguard>,
}

impl Default for MyApp {
    fn default() -> Self {
        Self {
            state: AppState::Wait,
            sudo_password: "".to_string(),
            wireguard: None,
        }
    }
}

impl eframe::App for MyApp {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        let can_run = self.sudo_password.len() > 0;

        egui::TopBottomPanel::top("top_panel").show(ctx, |ui| {
            // The top panel is often a good place for a menu bar:
            egui::menu::bar(ui, |ui| {
                ui.menu_button("File", |ui| {
                    if ui.button("Quit").clicked() {
                        _frame.close();
                    }
                });
            });
        });

        match &self.state {
            AppState::Wait => {
                egui::CentralPanel::default().show(ctx, |ui| {
                    ui.heading("Liquid Investigations VPN");

                    ui.horizontal(|ui| {
                        let sudo_password_label = ui.label("Sudo Password: ");
                        ui.text_edit_singleline(&mut self.sudo_password)
                            .labelled_by(sudo_password_label.id);
                    });

                    if ui.add_enabled(can_run, egui::Button::new("Go")).clicked() {
                        if let Err(msg) = test_sudo(&self.sudo_password) {
                            self.state = AppState::Error(msg.to_string());
                        } else {
                            if let Err(msg) = sudo_uname(&self.sudo_password) {
                                self.state = AppState::Error(msg.to_string());
                            } else {
                                self.wireguard = Some(Wireguard::new());
                                self.state = AppState::Done;
                            }
                        }
                    }
                });
            }

            AppState::Done => {
                egui::CentralPanel::default().show(ctx, |ui| {
                    ui.heading("Liquid Investigations VPN");

                    if let Some(wg) = &self.wireguard {
                        let wg_config = wg.wg_config().unwrap();

                        ui.horizontal(|ui| {
                            ui.label("Wireguard Public Key:");
                            ui.monospace(wg.public_encoded());
                            if ui.button("Copy to Clipboard").clicked() {
                                ui.output().copied_text = wg.public_encoded();
                            };
                        });

                        ui.monospace(wg_config);
                        if ui.button("Reset").clicked() {
                            self.sudo_password = "".to_string();
                            self.wireguard = None;
                            self.state = AppState::Wait;
                        }
                    } else {
                        self.state = AppState::Error("Wireguard config failed".to_string());
                    }
                });
            }

            AppState::Error(msg) => {
                let error = msg.clone();
                egui::CentralPanel::default().show(ctx, |ui| {
                    ui.monospace(error);
                    if ui.button("Restart").clicked() {
                        self.wireguard = None;
                        self.state = AppState::Wait;
                    }
                });
            }
        }
    }
}

fn main() {
    let options = eframe::NativeOptions {
        initial_window_size: Some(egui::vec2(600.0, 500.0)),
        ..Default::default()
    };
    eframe::run_native(
        "Liquid Investigations VPN Migration",
        options,
        Box::new(|_cc| Box::new(MyApp::default())),
    );
}
