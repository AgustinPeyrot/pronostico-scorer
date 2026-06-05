// ── components/Footer.jsx ────────────────────────────────────────────────────
// Leyenda de créditos discreta, reutilizable en todas las pantallas.

export default function Footer() {
  return (
    <footer className="w-full text-center py-4 px-4">
      <p className="text-slate-600 text-xs">
        Desarrollado por{' '}
        <a
          href="https://github.com/agustinpeyrot"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-400 transition-colors"
        >
          Agustín Peyrot
        </a>
        {' '}· Ing. en Sistemas · @agustinpeyrot
      </p>
    </footer>
  );
}
