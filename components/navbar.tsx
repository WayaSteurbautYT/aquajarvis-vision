"use client";

import { Github, Cpu } from "@geist-ui/icons";

interface NavbarProps {
  githubStars: number;
  openSettings: () => void;
  showLocalMode?: boolean;
  grayMode?: boolean;
}

export function Navbar({
  githubStars,
  openSettings,
  showLocalMode = true,
  grayMode = false,
}: NavbarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50">
      <div className="flex items-center gap-2">
        <img src="/logo.png" height={40} width={180} />
      </div>
      <div className="flex items-center gap-2">
        <a
          href="https://github.com/bullmeza/screen.vision"
          target="_blank"
          className={`flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg transition-colors ${
            grayMode
              ? "hover:bg-gray-50"
              : "bg-black text-white hover:bg-gray-700"
          }`}
        >
          <Github size={16} />
          <span className="text-sm">Star on GitHub</span>
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${
              grayMode ? "bg-gray-200 text-gray-700" : "bg-gray-100 text-black"
            }`}
          >
            {githubStars >= 1000
              ? `${(githubStars / 1000).toFixed(1)}k`
              : githubStars}
          </span>
        </a>

        {showLocalMode && (
          <button
            onClick={openSettings}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Cpu size={16} />
            <span className="text-sm">Local Mode</span>
          </button>
        )}
      </div>
    </div>
  );
}
