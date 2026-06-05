// ── components/ConfirmModal.jsx ──────────────────────────────────────────────
// Modal de confirmación para el reinicio de partida.
// Reemplaza el window.confirm nativo del navegador.

export default function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-slate-800 border border-white/20 rounded-2xl
                   shadow-2xl p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ícono + título */}
        <div className="text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-white text-xl font-bold">¿Reiniciar partida?</h2>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Se perderán todos los pedidos, resultados y puntajes cargados.
          </p>
        </div>

        {/* Botones — "Sí, reiniciar" primero para acción destructiva explícita */}
        <div className="flex flex-col gap-3">
          <button
            id="confirm-reset-btn"
            onClick={onConfirm}
            className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-400 active:bg-red-600
                       text-white font-bold text-base transition-colors"
          >
            Sí, reiniciar
          </button>
          <button
            id="cancel-reset-btn"
            onClick={onCancel}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/5
                       text-slate-300 font-semibold text-base border border-white/20 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
