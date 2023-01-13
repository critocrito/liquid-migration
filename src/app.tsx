import "./style.css";

import {invoke} from "@tauri-apps/api/tauri";
import React, {useState} from "react";

import Button from "./components/button";

type CommandError = {
  type: "error";
  message: string;
};

type WireguardConfig = {
  type: "success";
  public_key: string;
  private_key: string;
  config_file: string;
};

type Uname = {type: "success"; uname: string};
type AppConfig = {
  type: "success";
  project: string;
  vpn_server: {host: string; public_key: string};
  client: {ferm_config: string; wg_config: string};
};

type WireguardMessage = WireguardConfig | CommandError;
type UnameMessage = Uname | CommandError;
type AppConfigMessage = AppConfig;

type Error = {id: number; handler: string; message: string};

const App = () => {
  const [password, setPassword] = useState<string>("");
  const [uname, setUname] = useState<UnameMessage>();
  const [wgConfig, setWgConfig] = useState<WireguardMessage>();
  const [appConfig, setAppConfig] = useState<AppConfigMessage>();
  const [errors, setErrors] = useState<Error[]>([]);

  const invokeUname = async () => {
    const response = await invoke<UnameMessage>("uname", {password});

    if (response.type === "success") {
      setUname(response);
    } else if (response.type === "error") {
      setErrors([
        ...errors,
        {
          id: Date.now(),
          handler: "uname",
          message: response.message,
        },
      ]);
    }
  };

  const invokeWgConfig = async () => {
    const response = await invoke<WireguardMessage>("wg_config", {password});

    if (response.type === "success") {
      setWgConfig(response);
    } else if (response.type === "error") {
      setErrors([
        ...errors,
        {
          id: Date.now(),
          handler: "wgConfig",
          message: response.message,
        },
      ]);
    }
  };

  const invokeAppConfig = async () => {
    const response = await invoke<AppConfigMessage>("app_config", {});

    if (response.type === "success") {
      setAppConfig(response);
    }
  };

  const handleRun = async () => {
    setErrors([]);
    invokeUname();
    invokeWgConfig();
    invokeAppConfig();
  };

  const handleReset = () => {
    setPassword("");
    setUname(undefined);
    setWgConfig(undefined);
    setAppConfig(undefined);
    setErrors([]);
  };

  return (
    <div className="container mx-auto space-y-8 py-8">
      <h1 className="text-3xl font-bold">Liquid Investigations: Elbrus</h1>

      <form className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
          <div className="space-y-6 sm:space-y-5">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Migration
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                This wizard will guide you through the migration of your
                &apos;Liquid Investigations: Elbrus&apos; instance.
              </p>
            </div>

            <div className="space-y-6 sm:space-y-5">
              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                >
                  Password
                </label>
                <div className="mt-1 sm:col-span-2 sm:mt-0">
                  <input
                    id="password"
                    className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    placeholder="Enter a password..."
                    value={password}
                    type="password"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <Button onClick={handleReset} type="secondary" label="Reset" />

            <Button
              onClick={handleRun}
              label="Go"
              disabled={password === ""}
              className="ml-3 inline-flex justify-center"
            />
          </div>
        </div>
      </form>

      {errors.length > 0 && (
        <ul>
          {errors.map(({id, handler, message}) => (
            <li key={id} className="text-red-400">
              <b>{handler}</b>: {message}
            </li>
          ))}
        </ul>
      )}

      {appConfig && appConfig.type === "success" && (
        <p>App Config: {appConfig.project}</p>
      )}

      {uname && uname.type === "success" && <p>Host Uname: {uname.uname}</p>}

      {wgConfig && wgConfig.type === "success" && (
        <pre>{wgConfig.config_file}</pre>
      )}
    </div>
  );
};

export default App;
