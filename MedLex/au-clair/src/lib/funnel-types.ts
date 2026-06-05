export type TypeRemplacement = "continu" | "discontinu" | "";
export type Facturation = "directe" | "via-remplace" | "";
export type PaymentMode = "ma-part" | "tout" | null;

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
  facturation: Facturation;
  redevance: "oui" | "non" | "";
  nomRemplace: string;
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
  typeRemplacement: "",
  dateDebut: "",
  dateFin: "",
  periodes: "",
  facturation: "",
  redevance: "",
  nomRemplace: "Dr. Martin",
  nomRemplacant: "",
};

export const initialOtherParty: OtherParty = {
  name: "Dr. Martin",
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

export function funnelReducer(state: FunnelState, action: FunnelAction): FunnelState {
  switch (action.type) {
    case "SET_EMAIL":
      return { ...state, email: action.email };
    case "VERIFY_EMAIL":
      return { ...state, emailVerified: true, magicLinkExpired: false };
    case "SET_MAGIC_LINK_EXPIRED":
      return { ...state, magicLinkExpired: action.expired, emailVerified: false };
    case "PATCH_QUESTIONNAIRE":
      return {
        ...state,
        questionnaire: { ...state.questionnaire, ...action.patch },
        otherParty: {
          ...state.otherParty,
          name: action.patch.nomRemplace ?? state.otherParty.name,
        },
      };
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
