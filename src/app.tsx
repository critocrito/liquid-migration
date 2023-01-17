import "./style.css";

import {useMachine} from "@xstate/react";
import React from "react";

import Bootstrap from "$components/bootstrap";
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

  if (
    state.matches("loading") ||
    state.matches("verifyHost") ||
    state.matches("pollHost")
  )
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
        <Settings />
      </Shell>
    );

  if (state.matches("error"))
    return <Error onReset={() => send("RESET")}>{state.context.error}</Error>;

  return unreachable(`State ${state} not found`);
};

export default App;
