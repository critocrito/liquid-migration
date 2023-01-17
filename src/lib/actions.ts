import {invoke} from "@tauri-apps/api/tauri";

import {AppConfig} from "$lib/types";

export type ActionError = {
  type: "error";
  message: string;
};

export type ActionDelay = {
  type: "waiting";
  message?: string;
};

export type AppAction = {
  type: "success";
  project: string;
  vpn_server: {host: string; public_key: string};
  client: {ferm_config: string; wg_config: string};
};

export type HostAction = {
  type: "success";
};

export type AppActionMessage = AppAction | ActionError;
export type HostActionMessage = HostAction | ActionDelay | ActionError;

export const appAction = async (): Promise<AppConfig> => {
  const resp = await invoke<AppActionMessage>("app_config", {});

  if (resp.type === "error") {
    throw new Error(resp.message);
  }

  return {
    project: resp.project,
    server: resp.vpn_server,
    client: resp.client,
  };
};

export const hostAction = async (): Promise<"ok" | "poll"> => {
  const resp = await invoke<HostActionMessage>("host_setup", {});

  if (resp.type === "error") {
    throw new Error(resp.message);
  }

  if (resp.type === "waiting") {
    return "poll";
  }

  return "ok";
};
