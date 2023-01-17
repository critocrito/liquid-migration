import {ChevronLeftIcon} from "@heroicons/react/24/outline";
import React from "react";

interface HeaderBarProps {
  title: string;
  onNavigateBack?: () => void;
}

const HeaderBar = ({title, onNavigateBack}: HeaderBarProps) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl py-4 px-4 sm:px-6 lg:px-8 flex items-center">
        {onNavigateBack && (
          <button type="button" onClick={onNavigateBack}>
            <ChevronLeftIcon className="h-8 h-8 mr-4" />
          </button>
        )}

        <h1 className="text-lg font-semibold leading-6 text-gray-900">
          {title}
        </h1>
      </div>
    </header>
  );
};

export default HeaderBar;
