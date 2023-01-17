import {useMachine} from "@xstate/react";
import c from "clsx";
import React from "react";

import Onboarding from "$components/onboarding";
import useServiceLogger from "$lib/hooks/service-logger";
import {unreachable} from "$lib/utils";
import machine from "$machines/tasks";

const Loaded = () => {
  const [state, send, service] = useMachine(machine);

  useServiceLogger(service, machine.id);

  const btnClassName =
    "w-48 h-32 inline-flex items-center justify-center rounded-md border border-transparent bg-gray-700 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";

  if (state.matches("init"))
    return (
      <div className="w-full h-full flex items-center justify-center space-x-12">
        <button
          onClick={() => send("ONBOARD")}
          type="button"
          className={c(btnClassName)}
        >
          Onboarding
        </button>
      </div>
    );

  if (state.matches("onboarding"))
    return <Onboarding onCancel={() => send("CANCEL")} />;

  return unreachable(`State ${state} not found`);
};

export default Loaded;
