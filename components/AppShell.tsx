'use client';

import type { ReactNode } from 'react';
import ClickSpark from './circleSpark';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <ClickSpark sparkColor="#050040" sparkSize={8} sparkRadius={18}>
      <div className="relative z-0 min-h-screen w-full">{children}</div>
    </ClickSpark>
  );
}