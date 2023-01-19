import React from "react";

import Content from "$components/content";

interface StartDoneProps {
  onNext: () => void;
}

const StartDone = ({onNext}: StartDoneProps) => {
  return (
    <Content
      title="Start"
      description="Congratulations, you finished the VPN starting process. You should now be able to connect to https://liquidvpn.home.arpa. It is safe to close this app now."
      onNext={onNext}
      isFinal
    >
      <div />
    </Content>
  );
};

export default StartDone;
