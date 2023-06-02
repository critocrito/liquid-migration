import {useMachine} from "@xstate/react";
import React, {useState} from "react";

import Bootstrap from "$components/bootstrap";
import Error from "$components/error";
import StartDone from "$components/start-done";
import StartInit from "$components/start-init";
import StartPassword from "$components/start-password";
import useServiceLogger from "$lib/hooks/service-logger";
import {unreachable} from "$lib/utils";
import machine from "$machines/start";

interface StartProps {
  onCancel: () => void;
}

const Start = ({onCancel}: StartProps) => {
  const [state, send, service] = useMachine(machine);
  const [password, setPassword] = useState("");

  useServiceLogger(service, machine.id);

  if (
    state.matches("patchingSystem") ||
    state.matches("verifyHost") ||
    state.matches("pollHost") ||
    state.matches("hostIntermediary")
  ) {
    return <Bootstrap />;
  }

  if (state.matches("init")) {
    return <StartInit onNext={() => send("NEXT")} onCancel={onCancel} />;
  }

  if (state.matches("password")) {
    return (
      <StartPassword
        onNext={() => send("STORE_PASSWORD", {password})}
        onCancel={onCancel}
        onChange={setPassword}
        password={password}
      />
    );
  }

  if (state.matches("done")) {
    return <StartDone onNext={onCancel} />;
  }

  if (state.matches("error"))
    return <Error onReset={() => send("RESET")}>{state.context.error}</Error>;

  return unreachable(`Unmatched state ${state} in onboarding.`);
};

export default Start;
