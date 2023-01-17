import React from "react";

import Content from "$components/content";

interface OnboardingDoneProps {
  onNext: () => void;
}

const OnboardingDone = ({onNext}: OnboardingDoneProps) => {
  return (
    <Content
      title="Onboarding"
      description="Congratulations, you finished the onboarding process. You can now initialize the VPN connection from the main screen."
      onNext={onNext}
      isFinal
    >
      <div />
    </Content>
  );
};

export default OnboardingDone;
