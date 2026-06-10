import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="ac-logo">
      <span className="ac-logo__dot" aria-hidden />
      Au Clair
    </Link>
  );
}

export function TrustBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`ac-trust${compact ? " ac-trust--compact" : ""}`}>
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M12 3l7 4v6c0 4.5-3.2 8.7-7 9-3.8-.3-7-4.5-7-9V7l7-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
      <span>
        Validé par <strong>Maître Violaine</strong>
        {!compact && " · Avocate spécialisée en droit de la santé"}
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
  fullWidth = false,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}) {
  const cls = `ac-btn ac-btn--primary${fullWidth ? " ac-btn--full" : ""}${className ? ` ${className}` : ""}`;
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
  fullWidth = false,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  fullWidth?: boolean;
}) {
  const cls = `ac-btn ac-btn--secondary${fullWidth ? " ac-btn--full" : ""}${className ? ` ${className}` : ""}`;
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
    <div className="ac-progress">
      <div className="ac-progress__meta">
        <span>{label}</span>
        <span className="ac-progress__pct">{value} %</span>
      </div>
      <div className="ac-progress__track">
        <div className="ac-progress__fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function FunnelShell({
  children,
  step,
  total = 9,
  backHref,
}: {
  children: React.ReactNode;
  step?: number;
  total?: number;
  backHref?: string;
}) {
  const progress = step ? Math.round((step / total) * 100) : undefined;
  return (
    <div className="ac-page">
      <header className="ac-shell-header">
        <div className="ac-shell-header__row">
          <Logo href="/" />
          {backHref && (
            <Link href={backHref} className="ac-back">
              ← Retour
            </Link>
          )}
        </div>
        {progress != null && (
          <div className="ac-shell-header__progress">
            <ProgressBar value={progress} label={`Étape ${step} sur ${total}`} />
          </div>
        )}
      </header>
      <main className="ac-main">{children}</main>
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
    <div className="ac-simulate">
      <p className="ac-simulate__label">Maquette — simuler</p>
      <div className="ac-simulate__actions">
        {actions.map((a) => (
          <button key={a.label} type="button" onClick={a.onClick} className="ac-simulate__btn">
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
    brouillon: "ac-badge--brouillon",
    "en-attente-tiers": "ac-badge--attente-tiers",
    "en-attente-paiement": "ac-badge--attente-paiement",
    rembourse: "ac-badge--rembourse",
    signe: "ac-badge--signe",
  } as const;
  const labels = {
    brouillon: "Brouillon",
    "en-attente-tiers": "En attente de l'autre partie",
    "en-attente-paiement": "En attente de paiement",
    rembourse: "Remboursement déclenché",
    signe: "Signé",
  };
  return <span className={`ac-badge ${map[status]}`}>{labels[status]}</span>;
}

export function LockedClausePreview() {
  return (
    <div className="ac-locked">
      <div className="ac-locked__blur" aria-hidden>
        <div className="ac-locked__line" />
        <div className="ac-locked__line ac-locked__line--80" />
        <div className="ac-locked__line ac-locked__line--60" />
      </div>
      <div className="ac-locked__overlay">
        <span className="ac-locked__icon" aria-hidden>
          🔒
        </span>
        <span className="ac-locked__text">Texte complet débloqué après paiement</span>
      </div>
    </div>
  );
}

export function ChoiceButton({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ac-choice${selected ? " ac-choice--selected" : ""}`}
    >
      <p className="ac-choice__title">{title}</p>
      {description && <p className="ac-choice__desc">{description}</p>}
    </button>
  );
}

export function YesNoRow({
  value,
  onChange,
  className = "",
}: {
  value: "oui" | "non" | "";
  onChange: (v: "oui" | "non") => void;
  className?: string;
}) {
  return (
    <div className={`ac-choice-row${className ? ` ${className}` : ""}`}>
      {(["oui", "non"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`ac-choice${value === v ? " ac-choice--selected" : ""}`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
