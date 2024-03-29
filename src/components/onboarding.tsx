import {useMachine} from "@xstate/react";
import React, {useEffect, useState} from "react";

import Bootstrap from "$components/bootstrap";
import Error from "$components/error";
import OnboardingDone from "$components/onboarding-done";
import OnboardingInit from "$components/onboarding-init";
import OnboardingIpaddress from "$components/onboarding-ipaddress";
import OnboardingWireguard from "$components/onboarding-wireguard";
import useServiceLogger from "$lib/hooks/service-logger";
import {unreachable} from "$lib/utils";
import machine from "$machines/onboarding";

interface OnboardingProps {
  onCancel: () => void;
}

const Onboarding = ({onCancel}: OnboardingProps) => {
  const [state, send, service] = useMachine(machine);
  const [ipAddress, setIpAddress] = useState("");

  useEffect(() => {
    setIpAddress(state.context.ipAddress);
  }, [state.context.ipAddress]);

  useServiceLogger(service, machine.id);

  if (
    state.matches("persisting") ||
    state.matches("generatingWireguard") ||
    state.matches("cachedIp")
  ) {
    return <Bootstrap />;
  }

  if (state.matches("init")) {
    return <OnboardingInit onNext={() => send("NEXT")} onCancel={onCancel} />;
  }

  if (state.matches("wireguard")) {
    return (
      <OnboardingWireguard
        publicKey={state.context.wireguardConfig?.publicKey || ""}
        onNext={() => send("NEXT")}
        onCancel={onCancel}
      />
    );
  }

  if (state.matches("ipAddress")) {
    return (
      <OnboardingIpaddress
        onNext={() => send("STORE_IP", {ipAddress})}
        onCancel={onCancel}
        onChange={setIpAddress}
        ipAddress={ipAddress}
        disabled={state.context.ipAddress !== ""}
      />
    );
  }

  if (state.matches("done")) {
    return <OnboardingDone onNext={onCancel} />;
  }

  if (state.matches("error"))
    return <Error onReset={() => send("RESET")}>{state.context.error}</Error>;

  return unreachable(`Unmatched state ${state} in onboarding.`);
};

export default Onboarding;
