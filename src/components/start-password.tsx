import React from "react";

import Content from "$components/content";

interface StartPasswordProps {
  onNext: () => void;
  onCancel: () => void;
  onChange: (p: string) => void;
  password: string;
}

const StartPassword = ({
  onNext,
  onCancel,
  onChange,
  password,
}: StartPasswordProps) => {
  return (
    <Content
      title="Start"
      description="Please provide your administrator password. This is necessary to configure the system correctly and start the VPN."
      onNext={onNext}
      onCancel={onCancel}
      isDisabled={password === ""}
    >
      <div className="space-y-6 sm:space-y-5">
        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
          >
            Administrator Password
          </label>
          <div className="mt-1 sm:col-span-2 sm:mt-0">
            <input
              id="password"
              className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
              onChange={(e) => onChange(e.currentTarget.value)}
              placeholder="Enter a password..."
              value={password}
              type="password"
            />
          </div>
        </div>
      </div>
    </Content>
  );
};

export default StartPassword;
