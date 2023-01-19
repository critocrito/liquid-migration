import React from "react";

import Button from "$components/button";

interface SettingsProps {
  onDelete: () => void;
}

const Settings = ({onDelete}: SettingsProps) => {
  return (
    <div>
      <div className="mt-10 divide-y divide-gray-200">
        <div className="mt-6">
          <dl className="divide-y divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
              <dt className="text-sm font-medium text-gray-500">
                Delete previous onboarding?
              </dt>
              <dd className="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <span className="flex-grow" />
                <span className="ml-4 flex-shrink-0">
                  <Button label="Delete" onClick={onDelete} />
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Settings;
