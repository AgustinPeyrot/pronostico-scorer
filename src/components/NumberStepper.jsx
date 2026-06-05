// ── components/NumberStepper.jsx ─────────────────────────────────────────────
// Control reutilizable de tipo "− valor +" optimizado para móvil.
// Soporta un valor prohibido (forbiddenValue) que el stepper salta automáticamente.

export default function NumberStepper({ value, onChange, min = 0, max, forbiddenValue = null }) {

  // Al decrementar: si el siguiente valor es el prohibido, saltamos uno más abajo
  const dec = () => {
    let next = Math.max(min, value - 1);
    if (forbiddenValue !== null && next === forbiddenValue) {
      next = Math.max(min, next - 1);
    }
    // Solo actualizamos si realmente cambiamos y no terminamos en el prohibido
    if (next !== value && next !== forbiddenValue) onChange(next);
  };

  // Al incrementar: si el siguiente valor es el prohibido, saltamos uno más arriba
  const inc = () => {
    let next = Math.min(max ?? Infinity, value + 1);
    if (forbiddenValue !== null && next === forbiddenValue) {
      next = Math.min(max ?? Infinity, next + 1);
    }
    if (next !== value && next !== forbiddenValue) onChange(next);
  };

  // Calcula si se puede decrementar (contemplando el salto del prohibido)
  const canDec = (() => {
    if (value <= min) return false;
    let next = value - 1;
    if (forbiddenValue !== null && next === forbiddenValue) next = next - 1;
    return next >= min;
  })();

  // Calcula si se puede incrementar (contemplando el salto del prohibido)
  const canInc = (() => {
    if (max !== undefined && value >= max) return false;
    let next = value + 1;
    if (forbiddenValue !== null && next === forbiddenValue) next = next + 1;
    return max === undefined || next <= max;
  })();

  const isForbidden = forbiddenValue !== null && value === forbiddenValue;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={dec}
        disabled={!canDec}
        className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 text-xl font-bold
                   flex items-center justify-center
                   disabled:opacity-30 active:bg-slate-300 transition-colors"
        aria-label="Menos"
      >
        −
      </button>

      {/* El número se muestra en rojo si está en el valor prohibido */}
      <span className={`w-8 text-center text-xl font-bold tabular-nums
        ${isForbidden ? 'text-red-500' : 'text-slate-900'}`}>
        {value}
      </span>

      <button
        onClick={inc}
        disabled={!canInc}
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
