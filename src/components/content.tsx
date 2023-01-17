import React from "react";

import Button from "$components/button";

interface ContentProps {
  title: string;
  description: string;
  onNext: () => void;
  onCancel?: () => void;
  isFinal?: boolean;
  isDisabled?: boolean;
}

const Content = ({
  title,
  description,
  onNext,
  onCancel,
  children,
  isFinal = false,
  isDisabled = false,
}: React.PropsWithChildren<ContentProps>) => {
  return (
    <div className="space-y-8 divide-y divide-gray-200">
      <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
        <div className="space-y-6 sm:space-y-5">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {title}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {description}
            </p>
          </div>

          <div className="space-y-6 sm:space-y-5">{children}</div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          {onCancel && (
            <Button onClick={onCancel} type="secondary" label="Cancel" />
          )}

          <Button
            onClick={onNext}
            disabled={isDisabled}
            label={isFinal ? "Done" : "Next"}
            className="ml-3 inline-flex justify-center"
          />
        </div>
      </div>
    </div>
  );
};

export default Content;
