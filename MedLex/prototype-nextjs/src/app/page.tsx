import Link from "next/link";
import { BtnPrimary, Logo, TrustBadge } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="ac-page">
      <div className="ac-trust-bar">
        <TrustBadge compact />
      </div>

      <header className="ac-container" style={{ paddingBlock: "1rem" }}>
        <Logo />
      </header>

      <main className="ac-container ac-main--landing">
        <p className="ac-tagline">
          « Le juridique, expliqué comme par une collègue qui s&apos;y connaît. »
        </p>
        <h1 className="ac-title">Tu n&apos;es pas seule face aux papiers.</h1>
        <p className="ac-lede">
          Entre deux tournées, le contrat attend souvent dans un coin de ton bureau. Au Clair te guide
          pas à pas — avec des mots simples, et une avocate derrière chaque clause.
        </p>

        <div className="ac-actions">
          <BtnPrimary href="/parcours/email" fullWidth>
            Je crée mon contrat
          </BtnPrimary>
          <Link href="/parcours/tableau-de-bord" className="ac-link ac-centre">
            Voir le tableau de bord (maquette)
          </Link>
        </div>

        <div className="ac-note">
          <strong>Génère.</strong> Relis. Signe. — Conforme au Code de déontologie infirmier.
        </div>

        <section className="ac-steps">
          <h2 className="ac-title ac-title--sm">Comment ça marche</h2>
          {[
            ["1", "Tu réponds au questionnaire", "Comme à une collègue — on traduit en droit."],
            ["2", "Tu vois ce que chaque clause te apporte", "Avant de payer ou d'inviter l'autre partie."],
            ["3", "Vous signez sereinement", "Paiement partageable, remboursement si blocage."],
          ].map(([n, t, d]) => (
            <article key={n} className="ac-card ac-card--flat">
              <p className="ac-step-card__n">ÉTAPE {n}</p>
              <h3 className="ac-step-card__title">{t}</h3>
              <p className="ac-step-card__desc">{d}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="ac-footer">
        <p>© Au Clair 2026</p>
        <a href="mailto:contact@au-clair.app">contact@au-clair.app</a>
      </footer>
    </div>
  );
}
