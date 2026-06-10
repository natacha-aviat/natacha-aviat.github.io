export type TypeRemplacement = "continue" | "discontinu" | "planning" | "";
export type Facturation = "directe" | "via-remplace" | "";
export type PaymentMode = "ma-part" | "tout" | null;
export type OuiNon = "oui" | "non" | "";

export type ContractStatus =
  | "brouillon"
  | "en-attente-tiers"
  | "en-attente-paiement"
  | "rembourse"
  | "signe";

export type QuestionnaireData = {
  typeRemplacement: TypeRemplacement;
  dateDebut: string;
  dateFin: string;
  periodes: string;
  temporaire: OuiNon;
  motif: string;
  motifAutre: string;
  rCivilite: string;
  rNom: string;
  rOrdinal: string;
  rRpps: string;
  rAdresse: string;
  modeExercice: "seul" | "associes";
  associes: OuiNon;
  rpCivilite: string;
  rpNom: string;
  rpOrdinal: string;
  rpRpps: string;
  rpStatut: string;
  rpAdresse: string;
  multiRemplacements: "un" | "plus";
  lieu: "cabinet-remplace" | "cabinet-remplacant" | "autre";
  adresseLieu: string;
  accord: OuiNon;
  facturation: Facturation;
  tiersPayant: "oui" | "non";
  tauxTiersPayant: string;
  redevance: OuiNon;
  tauxRedevance: string;
  modeReglement: string;
  preavisAccord: string;
  preavisManquement: string;
  nonconcurrence: OuiNon;
  annexes: OuiNon;
  annexesTexte: string;
  /** @deprecated alias — synchronisé avec rNom */
  nomRemplace: string;
  /** @deprecated alias — synchronisé avec rpNom */
  nomRemplacant: string;
};

export type OtherParty = {
  name: string;
  role: "remplacé·e" | "consœur" | "cédant·e";
  email: string;
};

export type FunnelState = {
  email: string;
  emailVerified: boolean;
  questionnaire: QuestionnaireData;
  otherParty: OtherParty;
  invitationSent: boolean;
  thirdPartyValidated: boolean;
  paymentMode: PaymentMode;
  userPaid: boolean;
  otherPaid: boolean;
  userSigned: boolean;
  otherSigned: boolean;
  contractStatus: ContractStatus;
  refundTriggered: boolean;
  magicLinkExpired: boolean;
};

export const initialQuestionnaire: QuestionnaireData = {
  typeRemplacement: "continue",
  dateDebut: "",
  dateFin: "",
  periodes: "",
  temporaire: "oui",
  motif: "conge-maternite",
  motifAutre: "",
  rCivilite: "Mme",
  rNom: "Martin Claire",
  rOrdinal: "",
  rRpps: "",
  rAdresse: "12 rue des Lilas, 75011 Paris",
  modeExercice: "seul",
  associes: "oui",
  rpCivilite: "Mme",
  rpNom: "Marie Dupont",
  rpOrdinal: "",
  rpRpps: "",
  rpStatut: "Cabinet déjà installé·e",
  rpAdresse: "",
  multiRemplacements: "un",
  lieu: "cabinet-remplace",
  adresseLieu: "12 rue des Lilas, 75011 Paris",
  accord: "oui",
  facturation: "directe",
  tiersPayant: "non",
  tauxTiersPayant: "",
  redevance: "oui",
  tauxRedevance: "15",
  modeReglement: "Virement bancaire",
  preavisAccord: "15",
  preavisManquement: "8",
  nonconcurrence: "non",
  annexes: "non",
  annexesTexte: "",
  nomRemplace: "Martin Claire",
  nomRemplacant: "Marie Dupont",
};

export const initialOtherParty: OtherParty = {
  name: "Martin Claire",
  role: "remplacé·e",
  email: "",
};

export const initialFunnelState: FunnelState = {
  email: "",
  emailVerified: false,
  questionnaire: initialQuestionnaire,
  otherParty: initialOtherParty,
  invitationSent: false,
  thirdPartyValidated: false,
  paymentMode: null,
  userPaid: false,
  otherPaid: false,
  userSigned: false,
  otherSigned: false,
  contractStatus: "brouillon",
  refundTriggered: false,
  magicLinkExpired: false,
};

export type FunnelAction =
  | { type: "SET_EMAIL"; email: string }
  | { type: "VERIFY_EMAIL" }
  | { type: "SET_MAGIC_LINK_EXPIRED"; expired: boolean }
  | { type: "PATCH_QUESTIONNAIRE"; patch: Partial<QuestionnaireData> }
  | { type: "SET_OTHER_PARTY"; party: Partial<OtherParty> }
  | { type: "SEND_INVITATION" }
  | { type: "SIMULATE_THIRD_VALIDATED" }
  | { type: "SET_PAYMENT_MODE"; mode: PaymentMode }
  | { type: "SIMULATE_PAY"; who: "user" | "other" | "both" }
  | { type: "SIMULATE_SIGN"; who: "user" | "other" | "both" }
  | { type: "SIMULATE_REFUND" }
  | { type: "RESET" };

function syncQuestionnaireAliases(patch: Partial<QuestionnaireData>, current: QuestionnaireData) {
  const next = { ...current, ...patch };
  if (patch.rNom !== undefined) next.nomRemplace = patch.rNom;
  if (patch.rpNom !== undefined) next.nomRemplacant = patch.rpNom;
  if (patch.nomRemplace !== undefined) next.rNom = patch.nomRemplace;
  if (patch.nomRemplacant !== undefined) next.rpNom = patch.nomRemplacant;
  return next;
}

export function typeRemplacementLabel(type: TypeRemplacement): string {
  if (type === "continue") return "continu";
  if (type === "discontinu") return "discontinu";
  if (type === "planning") return "planning variable";
  return "—";
}

export function motifLabel(motif: string, motifAutre: string): string {
  const map: Record<string, string> = {
    "conge-maternite": "congé maternité",
    maladie: "maladie",
    formation: "formation",
    autre: motifAutre || "autre",
  };
  return map[motif] ?? motif;
}

export function funnelReducer(state: FunnelState, action: FunnelAction): FunnelState {
  switch (action.type) {
    case "SET_EMAIL":
      return { ...state, email: action.email };
    case "VERIFY_EMAIL":
      return { ...state, emailVerified: true, magicLinkExpired: false };
    case "SET_MAGIC_LINK_EXPIRED":
      return { ...state, magicLinkExpired: action.expired, emailVerified: false };
    case "PATCH_QUESTIONNAIRE": {
      const questionnaire = syncQuestionnaireAliases(action.patch, state.questionnaire);
      return {
        ...state,
        questionnaire,
        otherParty: {
          ...state.otherParty,
          name: questionnaire.rNom || state.otherParty.name,
        },
      };
    }
    case "SET_OTHER_PARTY":
      return { ...state, otherParty: { ...state.otherParty, ...action.party } };
    case "SEND_INVITATION":
      return {
        ...state,
        invitationSent: true,
        contractStatus: "en-attente-tiers",
      };
    case "SIMULATE_THIRD_VALIDATED":
      return {
        ...state,
        thirdPartyValidated: true,
        contractStatus: "en-attente-paiement",
      };
    case "SET_PAYMENT_MODE":
      return { ...state, paymentMode: action.mode };
    case "SIMULATE_PAY": {
      const next =
        action.who === "both"
          ? { userPaid: true, otherPaid: true }
          : action.who === "user"
            ? { userPaid: true }
            : { otherPaid: true };
      return { ...state, ...next };
    }
    case "SIMULATE_SIGN": {
      const userSigned = action.who === "user" || action.who === "both" ? true : state.userSigned;
      const otherSigned =
        action.who === "other" || action.who === "both" ? true : state.otherSigned;
      const signed = userSigned && otherSigned;
      return {
        ...state,
        userSigned,
        otherSigned,
        contractStatus: signed ? "signe" : state.contractStatus,
      };
    }
    case "SIMULATE_REFUND":
      return { ...state, refundTriggered: true, contractStatus: "rembourse" };
    case "RESET":
      return initialFunnelState;
    default:
      return state;
  }
}
