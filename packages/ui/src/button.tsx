"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
}

export const Button = ({ onClick, children }: ButtonProps) => {
  return (
    <button onClick={onClick} type="button" className="text-bg-dark bg-accent hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-accent font-mono font-bold rounded-sm text-sm px-5 py-2.5 me-2 mb-2 transition-colors duration-200">
      {children}
    </button>
  );
};
