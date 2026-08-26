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
      <h2 className="text-xl border-b border-border-dark pb-2 mb-4 font-sans font-semibold tracking-tight text-text-light">
        {title}
      </h2>
      <div>{children}</div>
    </div>
  );
}
