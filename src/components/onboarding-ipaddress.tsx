import React from "react";

import Content from "$components/content";

interface OnboardingIpaddressProps {
  onNext: () => void;
  onCancel: () => void;
  onChange: (p: string) => void;
  ipAddress: string;
}

const OnboardingIpaddress = ({
  onNext,
  onCancel,
  onChange,
  ipAddress,
}: OnboardingIpaddressProps) => {
  return (
    <Content
      title="Onboarding"
      description="Please enter here the client IP address that you received from your administrator."
      onNext={onNext}
      onCancel={onCancel}
      isDisabled={ipAddress === ""}
    >
      <div className="space-y-6 sm:space-y-5">
        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
          >
            Client IP address
          </label>
          <div className="mt-1 sm:col-span-2 sm:mt-0">
            <input
              id="password"
              className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
              onChange={(e) => onChange(e.currentTarget.value)}
              placeholder="Fill here your client IP address"
              value={ipAddress}
              type="text"
            />
          </div>
        </div>
      </div>
    </Content>
  );
};

export default OnboardingIpaddress;
