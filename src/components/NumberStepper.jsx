// ── components/NumberStepper.jsx ─────────────────────────────────────────────
// Control reutilizable de tipo "− valor +" optimizado para móvil.

export default function NumberStepper({ value, onChange, min = 0, max }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max ?? Infinity, value + 1));

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={dec}
        disabled={value <= min}
        className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 text-xl font-bold
                   flex items-center justify-center
                   disabled:opacity-30 active:bg-slate-300 transition-colors"
        aria-label="Menos"
      >
        −
      </button>

      <span className="w-8 text-center text-xl font-bold text-slate-900 tabular-nums">
        {value}
      </span>

      <button
        onClick={inc}
        disabled={max !== undefined && value >= max}
        className="w-10 h-10 rounded-full bg-indigo-600 text-white text-xl font-bold
                   flex items-center justify-center
                   disabled:opacity-30 active:bg-indigo-700 transition-colors"
        aria-label="Más"
      >
        +
      </button>
    </div>
  );
}
