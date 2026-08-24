import React from "react";

export function Card({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}): JSX.Element {
  return (
    <div
      className="border border-slate-800 p-6 bg-slate-900 rounded-xl"
    >
      <h1 className="text-xl border-b border-slate-700 pb-2">
        {title}
      </h1>
      <div>{children}</div>
    </div>
  );
}
