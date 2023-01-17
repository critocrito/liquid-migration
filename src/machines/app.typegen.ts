// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.app.loading:invocation[0]": {
      type: "done.invoke.app.loading:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.app.verifyHost:invocation[0]": {
      type: "done.invoke.app.verifyHost:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.app.loading:invocation[0]": {
      type: "error.platform.app.loading:invocation[0]";
      data: unknown;
    };
    "error.platform.app.verifyHost:invocation[0]": {
      type: "error.platform.app.verifyHost:invocation[0]";
      data: unknown;
    };
    "xstate.init": {type: "xstate.init"};
  };
  invokeSrcNameMap: {
    loadConfig: "done.invoke.app.loading:invocation[0]";
    verifyHost: "done.invoke.app.verifyHost:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    fail:
      | "error.platform.app.loading:invocation[0]"
      | "error.platform.app.verifyHost:invocation[0]";
    isPolling: "done.invoke.app.verifyHost:invocation[0]";
    pollHost: "done.invoke.app.verifyHost:invocation[0]";
    setConfig: "done.invoke.app.loading:invocation[0]";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {
    loadConfig: "RESET" | "xstate.init";
    verifyHost: "POLL" | "done.invoke.app.loading:invocation[0]";
  };
  matchesStates:
    | "error"
    | "loaded"
    | "loading"
    | "pollHost"
    | "settings"
    | "verifyHost";
  tags: never;
}
