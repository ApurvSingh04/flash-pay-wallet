import React from "react";

export function Card({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}): JSX.Element {
  return (
    <div className="border border-border-dark p-6 bg-card-bg rounded-sm shadow-none">
      <h1 className="text-xl border-b border-border-dark pb-2 mb-4 font-sans font-semibold tracking-tight text-text-light">
        {title}
      </h1>
      <div>{children}</div>
    </div>
  );
}
