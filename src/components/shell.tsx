import React from "react";

import HeaderBar from "$components/header-bar";
import MenuBar from "$components/menu-bar";

interface ShellProps {
  title: string;
  onClickSettings?: () => void;
  onClickBack?: () => void;
}

const Shell = ({
  title,
  onClickSettings = () => {},
  onClickBack,
  children,
}: React.PropsWithChildren<ShellProps>) => {
  return (
    <div className="min-h-full">
      <MenuBar onClickSettings={onClickSettings} />

      <HeaderBar title={title} onNavigateBack={onClickBack} />

      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
};

export default Shell;
