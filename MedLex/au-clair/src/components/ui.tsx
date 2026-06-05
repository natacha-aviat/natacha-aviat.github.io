import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-bold text-[#16314d]">
      <span className="h-2.5 w-2.5 rounded-full bg-[#0fa3a3]" aria-hidden />
      Au Clair
    </Link>
  );
}

export function TrustBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#e8edf1] bg-white text-[#16314d] shadow-sm ${
        compact ? "px-2.5 py-1 text-[0.68rem]" : "px-3 py-1.5 text-xs"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 stroke-[#0fa3a3]" fill="none" strokeWidth={2}>
        <path d="M12 3l7 4v6c0 4.5-3.2 8.7-7 9-3.8-.3-7-4.5-7-9V7l7-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
      <span>
        Validé par <strong className="font-semibold">Me Violaine</strong>
        {!compact && " · droit de la santé"}
      </span>
    </span>
  );
}

export function BtnPrimary({
  children,
  href,
  onClick,
  type = "button",
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const cls = `inline-flex w-full items-center justify-center rounded-[14px] bg-[#0fa3a3] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(15,163,163,0.35)] transition hover:bg-[#0c8585] disabled:opacity-50 sm:w-auto ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function BtnSecondary({
  children,
  href,
  onClick,
  type = "button",
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  const cls = `inline-flex w-full items-center justify-center rounded-[14px] border border-[#e8edf1] bg-white px-5 py-3.5 text-sm font-semibold text-[#16314d] transition hover:border-[#cdd5dc] sm:w-auto ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div className="mb-6">
      <div className="mb-1.5 flex items-center justify-between text-xs text-[#5f6b7a]">
        <span>{label}</span>
        <span className="tabular-nums font-semibold text-[#0fa3a3]">{value} %</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#e8edf1]">
        <div
          className="h-full rounded-full bg-[#0fa3a3] transition-all duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function FunnelShell({
  children,
  step,
  total = 8,
  backHref,
}: {
  children: React.ReactNode;
  step?: number;
  total?: number;
  backHref?: string;
}) {
  const progress = step ? Math.round((step / total) * 100) : undefined;
  return (
    <div className="min-h-dvh bg-[#fbfcfd]">
      <header className="sticky top-0 z-20 border-b border-[#e8edf1] bg-[#fbfcfd]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Logo href="/" />
          {backHref && (
            <Link href={backHref} className="text-sm font-medium text-[#5f6b7a] hover:text-[#16314d]">
              ← Retour
            </Link>
          )}
        </div>
        {progress != null && (
          <div className="mx-auto max-w-lg px-4 pb-3">
            <ProgressBar value={progress} label={`Étape ${step} sur ${total}`} />
          </div>
        )}
      </header>
      <main className="mx-auto max-w-lg px-4 py-6 pb-28">{children}</main>
    </div>
  );
}

export function SimulateBar({
  actions,
}: {
  actions: { label: string; onClick: () => void }[];
}) {
  if (actions.length === 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-dashed border-[#0fa3a3]/40 bg-[#16314d]/95 px-3 py-2 text-white backdrop-blur-sm">
      <p className="mb-1.5 text-center text-[10px] uppercase tracking-wide text-white/70">
        Maquette — simuler
      </p>
      <div className="mx-auto flex max-w-lg flex-wrap justify-center gap-1.5">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium hover:bg-white/20"
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StatusBadge({
  status,
}: {
  status: "en-attente-tiers" | "en-attente-paiement" | "rembourse" | "signe" | "brouillon";
}) {
  const map = {
    brouillon: "bg-[#e8edf1] text-[#5f6b7a]",
    "en-attente-tiers": "bg-amber-100 text-amber-800",
    "en-attente-paiement": "bg-blue-100 text-blue-800",
    rembourse: "bg-red-100 text-red-800",
    signe: "bg-green-100 text-green-800",
  } as const;
  const labels = {
    brouillon: "Brouillon",
    "en-attente-tiers": "En attente de l'autre partie",
    "en-attente-paiement": "En attente de paiement",
    rembourse: "Remboursement déclenché",
    signe: "Signé",
  };
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

export function LockedClausePreview() {
  return (
    <div className="relative mt-2 overflow-hidden rounded-lg bg-[#e8edf1] p-3">
      <div className="space-y-2 blur-[2px] select-none" aria-hidden>
        <div className="h-2 w-full rounded bg-[#cdd5dc]" />
        <div className="h-2 w-4/5 rounded bg-[#cdd5dc]" />
        <div className="h-2 w-3/5 rounded bg-[#cdd5dc]" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/60 text-center">
        <span className="text-lg" aria-hidden>
          🔒
        </span>
        <span className="px-2 text-[11px] font-medium text-[#5f6b7a]">
          Texte complet débloqué après paiement
        </span>
      </div>
    </div>
  );
}
