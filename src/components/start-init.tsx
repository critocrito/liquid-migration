import React from "react";

import Content from "$components/content";

interface StartInitProps {
  onNext: () => void;
  onCancel: () => void;
}

const StartInit = ({onNext, onCancel}: StartInitProps) => {
  return (
    <Content
      title="Start"
      description="This process will configure your running Tails installation to connect to the Liquid Investigation VPN. If you haven't finished your onboarding yet please do so before doing this."
      onNext={onNext}
      onCancel={onCancel}
    >
      <div />
    </Content>
  );
};

export default StartInit;
