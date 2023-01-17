import {createMachine} from "xstate";

type Context = Record<string, unknown>;
type Event = {type: "ONBOARD"} | {type: "CANCEL"};

export default createMachine({
  tsTypes: {} as import("./tasks.typegen").Typegen0,
  predictableActionArguments: true,
  schema: {
    context: {} as Context,
    events: {} as Event,
  },

  id: "tasks",

  initial: "init",

  context: {},

  states: {
    init: {
      on: {
        ONBOARD: {target: "onboarding"},
      },
    },

    onboarding: {
      on: {
        CANCEL: {target: "init"},
      },
    },
  },
});
