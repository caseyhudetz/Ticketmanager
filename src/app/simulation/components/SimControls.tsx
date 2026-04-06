'use client';

interface SimControlsProps {
  status: 'idle' | 'running' | 'paused';
  simTime: string;
  speed: number;
  tick: number;
  onStart: () => void;
  onPause: () => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
}

export default function SimControls({
  status,
  simTime,
  speed,
  tick,
  onStart,
  onPause,
  onSpeedChange,
  onReset,
}: SimControlsProps) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-gray-800 border-t border-b border-gray-700">
      {/* Play/Pause */}
      <div className="flex gap-2">
        {status === 'idle' ? (
          <button
            onClick={onStart}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded font-mono text-sm font-bold transition-colors"
          >
            &#9654; Start
          </button>
        ) : status === 'running' ? (
          <button
            onClick={onPause}
            className="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded font-mono text-sm font-bold transition-colors"
          >
            &#9646;&#9646; Pause
          </button>
        ) : (
          <button
            onClick={onPause}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded font-mono text-sm font-bold transition-colors"
          >
            &#9654; Resume
          </button>
        )}
        <button
          onClick={onReset}
          className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded font-mono text-sm transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Speed selector */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-xs font-mono">Speed:</span>
        {[1, 2, 5].map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-2 py-1 rounded text-xs font-mono font-bold transition-colors ${
              speed === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Clock */}
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-xs font-mono">Tick {tick}/32</span>
        <div className="px-3 py-1 bg-gray-900 rounded border border-gray-600">
          <span className="text-white font-mono text-lg font-bold">{simTime}</span>
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            status === 'running'
              ? 'bg-green-400 animate-pulse'
              : status === 'paused'
              ? 'bg-yellow-400'
              : 'bg-gray-500'
          }`}
        />
        <span className="text-gray-400 text-xs font-mono capitalize">{status}</span>
      </div>
    </div>
  );
}
