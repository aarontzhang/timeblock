export function Header() {
  return (
    <header className="bg-stone-50/70 backdrop-blur-xl px-4 py-5 sticky top-0 z-40">
      <div className="max-w-lg mx-auto flex items-center justify-center gap-2.5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-neutral-800 w-4 h-4">
          <line x1="12" y1="12" x2="12" y2="5" />
          <line x1="12" y1="12" x2="17" y2="15" />
        </svg>
        <h1 className="text-xs font-light tracking-[0.25em] uppercase text-neutral-800">timeblock</h1>
      </div>
    </header>
  );
}
