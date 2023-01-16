import {useMachine} from "@xstate/react";
import React from "react";

import Button from "$components/button";
import {unreachable} from "$lib/utils";
import OnboardingMachine from "$machines/onboarding";

const Onboarding = () => {
  const [state, send] = useMachine(OnboardingMachine);

  if (state.matches("init")) {
    return (
      <div>
        Init: <Button onClick={() => send("NEXT")} label="Next" />
      </div>
    );
  }

  if (state.matches("wireguard")) {
    return (
      <div>
        Wireguard: <Button onClick={() => send("NEXT")} label="Next" />
      </div>
    );
  }

  if (state.matches("ssl")) {
    return (
      <div>
        SSL: <Button onClick={() => send("NEXT")} label="Next" />
      </div>
    );
  }

  if (state.matches("done")) {
    return <div>Done</div>;
  }

  return unreachable(`Unmatched state ${state} in onboarding.`);
};

export default Onboarding;
