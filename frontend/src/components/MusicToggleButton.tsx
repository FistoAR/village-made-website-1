'use client';

import { useBgMusic } from '@/hooks/useBgMusic';

/**
 * MusicToggleButton
 * Floating pill button that toggles background ambient music.
 * Positioned fixed bottom-right; shows animated equaliser bars when playing.
 */
export default function MusicToggleButton() {
  const { isPlaying, toggle } = useBgMusic();

  return (
    <button
      id="bg-music-toggle"
      onClick={toggle}
      aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
      title={isPlaying ? 'Pause background music' : 'Play background music'}
      className="fixed bottom-8 right-23 z-[9999] flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-xl border border-[#eeddb9]/60 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer select-none"
      style={{
        background: isPlaying
          ? 'linear-gradient(135deg, rgba(56,68,1,0.92) 0%, rgba(112,70,50,0.92) 100%)'
          : 'rgba(253,251,247,0.88)',
        color: isPlaying ? '#fff' : '#3E2C1C',
      }}
    >
      {/* Equaliser animation when playing */}
      {isPlaying ? (
        <span className="flex items-end gap-[3px] h-5 w-[18px] shrink-0" aria-hidden="true">
          <span className="w-[3px] rounded-full bg-[#D4E47A] animate-eq1" style={{ animationDuration: '0.6s' }} />
          <span className="w-[3px] rounded-full bg-[#D4E47A] animate-eq2" style={{ animationDuration: '0.8s' }} />
          <span className="w-[3px] rounded-full bg-[#D4E47A] animate-eq3" style={{ animationDuration: '0.5s' }} />
          <span className="w-[3px] rounded-full bg-[#D4E47A] animate-eq1" style={{ animationDuration: '0.7s' }} />
        </span>
      ) : (
        /* Music note icon when paused */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 shrink-0 opacity-70"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9 3v11.77a3.5 3.5 0 1 0 1.5 2.73V8.27l9-2.25v7.75a3.5 3.5 0 1 0 1.5 2.73V5.5a1 1 0 0 0-1.22-.97L9.28 6.53A1 1 0 0 0 9 7.5V3Z" />
        </svg>
      )}

      <span className="text-[11px] font-bold tracking-wide font-jakarta whitespace-nowrap">
        {isPlaying ? 'Playing' : 'Music Off'}
      </span>

      {/* On/Off indicator dot */}
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 ${
          isPlaying ? 'bg-[#D4E47A] animate-pulse' : 'bg-stone-400'
        }`}
      />

      <style>{`
        @keyframes eq-bounce {
          0%, 100% { transform: scaleY(0.3); }
          50%       { transform: scaleY(1);   }
        }
        .animate-eq1 {
          height: 14px;
          transform-origin: bottom;
          animation: eq-bounce 0.6s ease-in-out infinite;
        }
        .animate-eq2 {
          height: 18px;
          transform-origin: bottom;
          animation: eq-bounce 0.8s ease-in-out infinite 0.15s;
        }
        .animate-eq3 {
          height: 10px;
          transform-origin: bottom;
          animation: eq-bounce 0.5s ease-in-out infinite 0.3s;
        }
      `}</style>
    </button>
  );
}
