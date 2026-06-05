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
      <div className="min-h-dvh bg-[#fbfcfd] pb-24">
        <header className="border-b border-[#e8edf1] px-4 py-4">
          <div className="mx-auto flex max-w-lg items-center justify-between">
            <Logo href="/" />
            <Link href="/parcours/email" className="text-sm font-medium text-[#0fa3a3]">
              + Nouveau contrat
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 py-6">
          <h1 className="mb-1 text-2xl font-bold text-[#16314d]">Ton tableau de bord</h1>
          <p className="mb-4 text-sm text-[#5f6b7a]">
            {state.email ? `Connecté·e en maquette : ${state.email}` : "Maquette — aucune auth réelle"}
          </p>
          <TrustBadge />

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#5f6b7a]">
              Mes contrats
            </h2>
            <div className="space-y-3">
              {state.contractStatus === "signe" && (
                <article className="rounded-[14px] border border-[#0fa3a3]/30 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-[#16314d]">
                        Remplacement — {state.otherParty.name}
                      </h3>
                      <p className="text-sm text-[#5f6b7a]">Signé le 3 juin 2026</p>
                    </div>
                    <StatusBadge status="signe" />
                  </div>
                </article>
              )}

              {DEMO_CONTRACTS.filter((c) => c.id !== "current" || state.contractStatus !== "signe").map(
                (c) => (
                  <article
                    key={c.id}
                    className="rounded-[14px] border border-[#e8edf1] bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-[#16314d]">
                          {c.title} — {c.subtitle}
                        </h3>
                        <p className="text-sm text-[#5f6b7a]">{c.date}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  </article>
                )
              )}

              {state.refundTriggered && (
                <article className="rounded-[14px] border border-red-200 bg-red-50 p-4">
                  <StatusBadge status="rembourse" />
                  <p className="mt-2 text-sm text-red-900">
                    Remplacement — exemple remboursé (délai 1 mois dépassé).
                  </p>
                </article>
              )}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#5f6b7a]">
              Infos juridiques utiles
            </h2>
            <div className="grid gap-2">
              {LEGAL_LINKS.map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  className="rounded-[14px] border border-[#e8edf1] bg-white px-4 py-3 text-sm font-medium text-[#16314d] hover:border-[#0fa3a3]/40"
                  onClick={(e) => e.preventDefault()}
                >
                  {link.title} →
                </a>
              ))}
            </div>
          </section>

          <div className="mt-8">
            <BtnPrimary href="/parcours/email">Créer un autre contrat</BtnPrimary>
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
