import React from "react";

import Content from "$components/content";

interface OnboardingInitProps {
  onNext: () => void;
  onCancel: () => void;
}

const OnboardingInit = ({onNext, onCancel}: OnboardingInitProps) => {
  return (
    <Content
      title="Onboarding"
      description="This process will guide you through a short onboarding process. Please follow each step and don't hesitate to ask if you encounter any problems."
      onNext={onNext}
      onCancel={onCancel}
    >
      <div />
    </Content>
  );
};

export default OnboardingInit;
