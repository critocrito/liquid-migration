use eframe::egui;
use egui::Ui;
use lazy_async_promise::{ImmediateValuePromise, ImmediateValueState};
use std::str;
use thiserror::Error;

mod cmd;
mod wg;

#[derive(Error, Debug)]
enum VpnMigrationAppError {
    #[error("command error")]
    Command(#[from] cmd::CmdError),
    #[error("wireguard error")]
    Wg(#[from] wg::WgError),
}

enum Page {
    Start,
    Run(ImmediateValuePromise<()>),
    Done,
    Error(String),
}

struct VpnMigrationApp {
    sudo_password: String,
    wireguard: Option<wg::Wireguard>,
    page: Page,
}

impl Default for VpnMigrationApp {
    fn default() -> Self {
        Self {
            page: Page::Start,
            sudo_password: "".to_string(),
            wireguard: None,
        }
    }
}

impl VpnMigrationApp {
    fn ui_start_page(&mut self, ui: &mut Ui) {
        let can_run = self.sudo_password.len() > 0;

        ui.heading("Prepare Configuration");

        ui.horizontal(|ui| {
            let sudo_password_label = ui.label("Password: ");
            ui.text_edit_singleline(&mut self.sudo_password)
                .labelled_by(sudo_password_label.id);
        });

        ui.separator();

        if ui.add_enabled(can_run, egui::Button::new("Go")).clicked() {
            self.wireguard = Some(wg::Wireguard::new());
            self.page = Page::Run(cmd::setup_vpn(self.sudo_password.clone()));
        }
    }

    fn ui_run_page(&mut self, ui: &mut Ui) {
        ui.heading("Running Configuration");

        let cmd_run = match &mut self.page {
            Page::Run(cmd_run) => cmd_run,
            _ => return,
        };

        match cmd_run.poll_state() {
            ImmediateValueState::Success(_) => {
                self.page = Page::Done;
            }
            ImmediateValueState::Error(e) => {
                self.page = Page::Error(format!("Error setting up VPN: {}", **e));
            }
            _ => {
                ui.horizontal(|ui| {
                    ui.add(egui::widgets::Spinner::new());
                });
            }
        }
    }

    fn ui_done_page(&mut self, ui: &mut Ui) {
        ui.heading("Configuration done.");

        if let Some(wg) = &self.wireguard {
            let wg_config = wg.wg_config().unwrap();

            ui.horizontal(|ui| {
                ui.label("VPN Public Key:");
                ui.monospace(wg.public_encoded());
                if ui.button("Copy to Clipboard").clicked() {
                    ui.output().copied_text = wg.public_encoded();
                };
            });

            ui.horizontal(|ui| {
                ui.label("VPN Private Key:");
                ui.monospace(wg.secret_encoded());
                if ui.button("Copy to Clipboard").clicked() {
                    ui.output().copied_text = wg.secret_encoded();
                };
            });

            ui.horizontal(|ui| {
                ui.label("VPN Config:");
                ui.monospace(wg_config);
                if ui.button("Copy to Clipboard").clicked() {
                    ui.output().copied_text = wg.secret_encoded();
                };
            });

            ui.separator();
        } else {
            ui.label("VPN key generation failed.");
        }

        if ui.button("Reset").clicked() {
            self.sudo_password = "".to_string();
            self.wireguard = None;
            self.page = Page::Start;
        }
    }

    fn ui_error_page(&mut self, error: &str, ui: &mut Ui) {
        ui.heading("Something went wrong.");

        ui.monospace(error);

        ui.separator();

        if ui.button("Restart").clicked() {
            self.wireguard = None;
            self.page = Page::Start;
        }
    }
}

impl eframe::App for VpnMigrationApp {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
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

        match &self.page {
            Page::Start => {
                egui::CentralPanel::default().show(ctx, |ui| self.ui_start_page(ui));
            }

            Page::Run(_) => {
                egui::CentralPanel::default().show(ctx, |ui| self.ui_run_page(ui));
            }

            Page::Done => {
                egui::CentralPanel::default().show(ctx, |ui| self.ui_done_page(ui));
            }

            Page::Error(msg) => {
                let error = msg.clone();
                egui::CentralPanel::default().show(ctx, |ui| self.ui_error_page(&error, ui));
            }
        }
    }
}

#[tokio::main]
async fn main() {
    let options = eframe::NativeOptions {
        initial_window_size: Some(egui::vec2(768.0, 500.0)),
        ..Default::default()
    };

    eframe::run_native(
        "Elbrus VPN Migration",
        options,
        Box::new(|_cc| Box::new(VpnMigrationApp::default())),
    );
}
