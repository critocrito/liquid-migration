import {ClipboardDocumentIcon} from "@heroicons/react/24/outline";
import c from "clsx";
import copy from "copy-to-clipboard";
import React, {useEffect, useState} from "react";

import Content from "$components/content";

interface OnboardingWireguardProps {
  publicKey: string;
  onNext: () => void;
  onCancel: () => void;
}

const OnboardingWireguard = ({
  publicKey,
  onNext,
  onCancel,
}: OnboardingWireguardProps) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return () => {};

    const timer = setTimeout(() => setIsCopied(false), 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [isCopied]);

  return (
    <Content
      title="Onboarding"
      description="This is the public key for your VPN connection. Please share this key as part of your onboarding process."
      onNext={onNext}
      onCancel={onCancel}
    >
      <div className="space-y-6 sm:space-y-5">
        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
          <div>Public Key</div>
          <div className="mt-1 sm:col-span-2 sm:mt-0 flex items-center space-x-2">
            <span className="font-mono">{publicKey}</span>
            <button
              type="button"
              onClick={() => {
                setIsCopied(true);
                copy(publicKey);
              }}
            >
              <ClipboardDocumentIcon
                className={c("transition-colors h-6 h-6", {
                  "text-green-500": isCopied,
                  "text-gray-500 hover:text-gray-900": !isCopied,
                })}
              />
            </button>
          </div>
        </div>
      </div>
    </Content>
  );
};

export default OnboardingWireguard;
