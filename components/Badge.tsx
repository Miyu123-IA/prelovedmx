import clsx from 'clsx';

const ESTILOS: Record<string, string> = {
  disponible: 'bg-olivo/15 text-olivo-dark',
  apartado: 'bg-mostaza/20 text-mostaza-dark',
  vendido: 'bg-tinta/10 text-tinta/70',
  unica: 'bg-terracota text-crema-light',
};

export default function Badge({ tipo = 'unica', children }: { tipo?: string; children: React.ReactNode }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', ESTILOS[tipo])}>
      {children}
    </span>
  );
}
