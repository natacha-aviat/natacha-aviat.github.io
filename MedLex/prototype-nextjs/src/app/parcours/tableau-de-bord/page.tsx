"use client";

import Link from "next/link";
import { useFunnel } from "@/components/FunnelProvider";
import { DEMO_CONTRACTS, LEGAL_LINKS } from "@/lib/demo-data";
import {
  BtnPrimary,
  Logo,
  SimulateBar,
  StatusBadge,
  TrustBadge,
} from "@/components/ui";

export default function TableauDeBordPage() {
  const { state, dispatch } = useFunnel();

  return (
    <>
      <div className="ac-page ac-page--padded-bottom">
        <header className="ac-dash-header">
          <Logo href="/" />
          <Link href="/parcours/email" className="ac-link">
            + Nouveau contrat
          </Link>
        </header>

        <main className="ac-main">
          <h1 className="ac-title ac-title--page">Ton tableau de bord</h1>
          <p className="ac-microcopy ac-spacer-sm">
            {state.email ? `Connecté·e en maquette : ${state.email}` : "Maquette — aucune auth réelle"}
          </p>
          <TrustBadge />

          <section className="ac-spacer-lg">
            <h2 className="ac-section-title">Mes contrats</h2>
            <div className="ac-card-grid">
              {state.contractStatus === "signe" && (
                <article className="ac-card ac-card--signed">
                  <div className="ac-contract-row">
                    <div>
                      <h3 className="ac-card__title">
                        Remplacement — {state.otherParty.name}
                      </h3>
                      <p className="ac-card__desc">Signé le 3 juin 2026</p>
                    </div>
                    <StatusBadge status="signe" />
                  </div>
                </article>
              )}

              {DEMO_CONTRACTS.filter((c) => c.id !== "current" || state.contractStatus !== "signe").map(
                (c) => (
                  <article key={c.id} className="ac-card ac-card--flat">
                    <div className="ac-contract-row">
                      <div>
                        <h3 className="ac-card__title">
                          {c.title} — {c.subtitle}
                        </h3>
                        <p className="ac-card__desc">{c.date}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  </article>
                )
              )}

              {state.refundTriggered && (
                <article className="ac-alert ac-alert--danger">
                  <StatusBadge status="rembourse" />
                  <p>Remplacement — exemple remboursé (délai 1 mois dépassé).</p>
                </article>
              )}
            </div>
          </section>

          <section className="ac-spacer-lg">
            <h2 className="ac-section-title">Infos juridiques utiles</h2>
            <div className="ac-link-grid">
              {LEGAL_LINKS.map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  className="ac-link-card"
                  onClick={(e) => e.preventDefault()}
                >
                  {link.title} →
                </a>
              ))}
            </div>
          </section>

          <div className="ac-spacer-lg">
            <BtnPrimary href="/parcours/email" fullWidth>
              Créer un autre contrat
            </BtnPrimary>
          </div>
        </main>
      </div>

      <SimulateBar
        actions={[
          {
            label: "État : en attente tiers",
            onClick: () => {
              dispatch({ type: "SEND_INVITATION" });
            },
          },
          {
            label: "État : remboursement",
            onClick: () => dispatch({ type: "SIMULATE_REFUND" }),
          },
          {
            label: "Réinitialiser la maquette",
            onClick: () => dispatch({ type: "RESET" }),
          },
        ]}
      />
    </>
  );
}
