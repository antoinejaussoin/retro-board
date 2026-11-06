export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-paper text-ink">
      <div className="flex text-6xl font-semibold tracking-tight">
        R
        <span className="animate-[blink_1s_infinite]">.</span>
        <span className="animate-[blink_1s_infinite_250ms]">.</span>
        <span className="animate-[blink_1s_infinite_500ms]">.</span>
      </div>
      <style>
        {`@keyframes blink { 50% { color: transparent } }`}
      </style>
    </div>
  );
}
