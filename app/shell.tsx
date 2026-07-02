'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import IntroExperience from '@/components/intro-experience';
import { useLang } from '@/lib/language-context';

export default function Shell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const { lang } = useLang();

  return (
    <>
      {/* Intro overlay — rendered until user goes through onboarding */}
      {!introComplete && (
        <IntroExperience onComplete={() => setIntroComplete(true)} />
      )}

      {/* Main app — always rendered so data loads in background */}
      <div
        className="flex h-screen bg-background"
        style={{
          /* Invisible until intro finishes, but still mounts and fetches data */
          opacity: introComplete ? 1 : 0,
          pointerEvents: introComplete ? 'auto' : 'none',
          transition: 'opacity 0.6s ease',
        }}
      >
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className={`flex flex-col flex-1 min-w-0 ${lang === 'ar' ? 'lg:pr-64' : 'lg:pl-64'}`}>
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </>
  );
}
