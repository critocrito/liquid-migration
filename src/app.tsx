import "./style.css";

import {useMachine} from "@xstate/react";
import React from "react";

import Bootstrap from "$components/bootstrap";
import ConfirmAction from "$components/confirm-action";
import Error from "$components/error";
import Loaded from "$components/loaded";
import Settings from "$components/settings";
import Shell from "$components/shell";
import useServiceLogger from "$lib/hooks/service-logger";
import {unreachable} from "$lib/utils";
import machine from "$machines/app";

const App = () => {
  const [state, send, service] = useMachine(machine);

  useServiceLogger(service, machine.id);

  if (state.matches("loading") || state.matches("deleteState"))
    return <Bootstrap />;

  if (state.matches("loaded"))
    return (
      <Shell
        title={state.context.project || ""}
        onClickSettings={() => send("EDIT")}
      >
        <Loaded />
      </Shell>
    );

  if (state.matches("error"))
    return <Error onReset={() => send("RESET")}>{state.context.error}</Error>;

  if (state.matches("settings"))
    return (
      <Shell title="Settings" onClickBack={() => send("CANCEL")}>
        <Settings onDelete={() => send("DELETE_STATE")} />
      </Shell>
    );

  if (state.matches("confirmDeleteState"))
    return (
      <Shell title="Settings" onClickBack={() => {}}>
        <ConfirmAction
          title="Delete Onboarding Information"
          label="Delete"
          description="Are you sure you want to remove the previous onboarding information? All data will be removed from your local installation. This action cannot be undone."
          onConfirm={() => send("OK")}
          onCancel={() => send("CANCEL")}
        />
        <Settings onDelete={() => {}} />
      </Shell>
    );

  if (state.matches("error"))
    return <Error onReset={() => send("RESET")}>{state.context.error}</Error>;

  return unreachable(`State ${state} not found`);
};

export default App;
