// ── components/NumberStepper.jsx ─────────────────────────────────────────────
// Control reutilizable de tipo "− valor +" optimizado para móvil.
//
// Props:
//   value            → número actual
//   onChange         → callback(nuevoValor)
//   min              → mínimo (default 0)
//   max              → máximo (default sin límite)
//   forbiddenValue   → valor prohibido (modo desafío — lo salta automáticamente)
//   disabledIncrement → fuerza deshabilitar el botón +
//   disabledDecrement → fuerza deshabilitar el botón -

export default function NumberStepper({
  value,
  onChange,
  min = 0,
  max,
  forbiddenValue = null,
  disabledIncrement = false,
  disabledDecrement = false,
}) {

  const dec = () => {
    let next = Math.max(min, value - 1);
    if (forbiddenValue !== null && next === forbiddenValue) {
      next = Math.max(min, next - 1);
    }
    if (next !== value && next !== forbiddenValue) onChange(next);
  };

  const inc = () => {
    let next = Math.min(max ?? Infinity, value + 1);
    if (forbiddenValue !== null && next === forbiddenValue) {
      next = Math.min(max ?? Infinity, next + 1);
    }
    if (next !== value && next !== forbiddenValue) onChange(next);
  };

  const canDec = (() => {
    if (disabledDecrement || value <= min) return false;
    let next = value - 1;
    if (forbiddenValue !== null && next === forbiddenValue) next = next - 1;
    return next >= min && next !== forbiddenValue;
  })();

  const canInc = (() => {
    if (disabledIncrement) return false;
    if (max !== undefined && value >= max) return false;
    let next = value + 1;
    if (forbiddenValue !== null && next === forbiddenValue) next = next + 1;
    return (max === undefined || next <= max) && next !== forbiddenValue;
  })();

  const isForbidden = forbiddenValue !== null && value === forbiddenValue;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={dec}
        disabled={!canDec}
        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white text-xl font-bold
                   flex items-center justify-center
                   disabled:opacity-30 active:bg-white/10 transition-colors"
        aria-label="Menos"
      >
        −
      </button>

      {/* Valor — texto blanco para ser visible sobre fondos oscuros */}
      <span className={`w-8 text-center text-xl font-bold tabular-nums
        ${isForbidden ? 'text-red-400' : 'text-white'}`}>
        {value}
      </span>

      <button
        onClick={inc}
        disabled={!canInc}
        className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xl font-bold
                   flex items-center justify-center
                   disabled:opacity-30 active:bg-indigo-700 transition-colors"
        aria-label="Más"
      >
        +
      </button>
    </div>
  );
}
