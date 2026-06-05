import Link from "next/link";
import { BtnPrimary, Logo, TrustBadge } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-[#fbfcfd]">
      <div className="sticky top-0 z-10 border-b border-[#e8edf1] bg-[#fbfcfd]/95 px-4 py-2 text-center backdrop-blur-sm">
        <TrustBadge compact />
      </div>

      <header className="mx-auto max-w-lg px-4 py-4">
        <Logo />
      </header>

      <main className="mx-auto max-w-lg px-4 pb-12">
        <p className="mb-2 text-base italic text-[#0c8585]">
          « Le juridique, expliqué comme par une collègue qui s&apos;y connaît. »
        </p>
        <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-[#16314d]">
          Tu n&apos;es pas seule face aux papiers.
        </h1>
        <p className="mb-6 text-[#5f6b7a]">
          Entre deux tournées, le contrat attend souvent dans un coin de ton bureau. Au Clair te guide
          pas à pas — avec des mots simples, et une avocate derrière chaque clause.
        </p>

        <div className="mb-6 flex flex-col gap-3">
          <BtnPrimary href="/parcours/email">Je crée mon contrat</BtnPrimary>
          <Link
            href="/parcours/tableau-de-bord"
            className="text-center text-sm font-medium text-[#0fa3a3]"
          >
            Voir le tableau de bord (maquette)
          </Link>
        </div>

        <div className="rounded-[14px] border border-[#e8edf1] bg-white p-4 text-sm text-[#5f6b7a]">
          <strong className="text-[#16314d]">Génère.</strong> Relis. Signe. — Conforme au Code de
          déontologie infirmier.
        </div>

        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-bold text-[#16314d]">Comment ça marche</h2>
          {[
            ["1", "Tu réponds au questionnaire", "Comme à une collègue — on traduit en droit."],
            ["2", "Tu vois ce que chaque clause te apporte", "Avant de payer ou d'inviter l'autre partie."],
            ["3", "Vous signez sereinement", "Paiement partageable, remboursement si blocage."],
          ].map(([n, t, d]) => (
            <article key={n} className="rounded-[14px] border border-[#e8edf1] bg-white p-4">
              <p className="text-xs font-bold text-[#0fa3a3]">ÉTAPE {n}</p>
              <h3 className="font-semibold text-[#16314d]">{t}</h3>
              <p className="mt-1 text-sm text-[#5f6b7a]">{d}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t border-[#e8edf1] px-4 py-6 text-center text-xs text-[#5f6b7a]">
        <p>© Au Clair 2026</p>
        <a href="mailto:contact@au-clair.app" className="mt-1 inline-block text-[#0fa3a3]">
          contact@au-clair.app
        </a>
      </footer>
    </div>
  );
}
