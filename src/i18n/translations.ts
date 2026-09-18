export type Lang = "en" | "fr";

export const FLAGS: Record<Lang, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
};

export interface Dict {
  causeLine: string;
  liveNow: string;
  heroTitleLine2: string;
  heroIntro: string;
  raisedSoFar: string;
  startsIn: string;
  countdownUnits: string;
  donateNow: string;
  watchLive: string;
  iWantToSki: string;
  statDate: string;
  statHourCap: string;
  statChip: string;
  inSupportOf: string;
  aboutHeading: string;
  aboutP1: string;
  aboutP2: string;
  aboutP3: string;
  scheduleHeading: string;
  scheduleIntro: string;
  daySaturday: string;
  daySunday: string;
  dayAbbrSat: string;
  dayAbbrSun: string;
  slotOpen: string;
  slotSelected: string;
  slotFullCount: string;
  slotConfirmedCount: string;
  slotOpenCount: string;
  joinThisSlot: string;
  scheduleFootnote: string;
  modalTitle: string;
  joining: string;
  fullNamePlaceholder: string;
  phonePlaceholder: string;
  confirm: string;
  submitting: string;
  submitError: string;
  modalFineprint: string;
  thanksTitle: string;
  thanksPending: string;
  thanksBody: string;
  done: string;
  footerTagline: string;
  footerDonate: string;
  footerWatchLive: string;
  madePossibleBy: string;
}

export const translations: Record<Lang, Dict> = {
  en: {
    causeLine: "For Perth Children's Hospital Foundation",
    liveNow: "Live now",
    heroTitleLine2: "SkiErg Relay",
    heroIntro:
      "Every dollar donated helps WA's sick kids at Perth Children's Hospital — and pushes us further than 100km.",
    raisedSoFar: "raised so far",
    startsIn: "Starts in",
    countdownUnits: "dd : hh : mm",
    donateNow: "Donate Now",
    watchLive: "Watch Live",
    iWantToSki: "I want to Ski!",
    statDate: "3–4 Oct",
    statHourCap: "29 hour cap",
    statChip: "100% to PCHF",
    inSupportOf: "In support of",
    aboutHeading: "The challenge",
    aboutP1:
      "100 km on the SkiErg is just the baseline. We ski it in relay across one weekend, running two-person rotations with day volunteers, then dropping down to a dedicated duo through the night until the clock runs out at 29 hours.",
    aboutP2:
      "Donations push the distance further. Every dollar raised adds metres to the target, so the final number on the board is set by the people watching, not by us.",
    aboutP3:
      "All proceeds go to PCHF's Everest 2027 Project Beyond Limits campaign. Nothing is processed on this site — donations are handled entirely on PCHF's own fundraising page.",
    scheduleHeading: "Take an hour",
    scheduleIntro:
      "Join us on the challenge! Pick the hour you want, we'll put your name on the board and invite you to the WhatsApp group.",
    daySaturday: "Saturday 3 Oct",
    daySunday: "Sunday 4 Oct",
    dayAbbrSat: "Sat",
    dayAbbrSun: "Sun",
    slotOpen: "Open",
    slotSelected: "Selected",
    slotFullCount: "2/2 full",
    slotConfirmedCount: "confirmed",
    slotOpenCount: "open",
    joinThisSlot: "Join this slot",
    scheduleFootnote: "8:00pm Sat – 3:00am Sun is the core team's overnight stretch",
    modalTitle: "Join this slot",
    joining: "Joining",
    fullNamePlaceholder: "Full name",
    phonePlaceholder: "Phone number",
    confirm: "Confirm",
    submitting: "Sending…",
    submitError: "Something went wrong — please try again.",
    modalFineprint:
      "Your phone number is for the organiser only and is never shown on the page. Joining creates a pending registration for that hour.",
    thanksTitle: "Thanks — we'll confirm your slot shortly",
    thanksPending: "Pending",
    thanksBody: "Your name appears on the schedule once the organiser confirms it.",
    done: "Done",
    footerTagline: "In support of PCHF · Project Beyond Limits",
    footerDonate: "Donate",
    footerWatchLive: "Watch live",
    madePossibleBy: "Made possible by",
  },
  fr: {
    causeLine: "Au profit de la Perth Children's Hospital Foundation",
    liveNow: "En direct",
    heroTitleLine2: "Relais SkiErg",
    heroIntro:
      "Chaque dollar donné aide les enfants malades d'Australie-Occidentale à l'hôpital pour enfants de Perth — et nous pousse au-delà des 100 km.",
    raisedSoFar: "récoltés à ce jour",
    startsIn: "Départ dans",
    countdownUnits: "jj : hh : mm",
    donateNow: "Faire un don",
    watchLive: "Voir en direct",
    iWantToSki: "Je veux skier !",
    statDate: "3–4 oct.",
    statHourCap: "29 heures max",
    statChip: "100 % pour PCHF",
    inSupportOf: "Au profit de",
    aboutHeading: "Le défi",
    aboutP1:
      "100 km sur le SkiErg, c'est juste la base. On les fait en relais sur tout un week-end, avec des rotations de deux personnes assurées par des bénévoles en journée, puis un duo dédié qui prend le relais la nuit jusqu'à la fin des 29 heures.",
    aboutP2:
      "Les dons repoussent la distance plus loin. Chaque dollar récolté ajoute des mètres à l'objectif, donc le chiffre final affiché est fixé par ceux qui regardent, pas par nous.",
    aboutP3:
      "Tous les fonds vont à la campagne Everest 2027 Project Beyond Limits de PCHF. Aucun paiement n'est traité sur ce site — les dons se font entièrement sur la page de collecte de PCHF.",
    scheduleHeading: "Réserve ton heure",
    scheduleIntro:
      "Rejoignez le défi ! Choisissez votre heure, on inscrit votre nom sur le tableau et on vous invite dans le groupe WhatsApp.",
    daySaturday: "Samedi 3 oct.",
    daySunday: "Dimanche 4 oct.",
    dayAbbrSat: "Sam",
    dayAbbrSun: "Dim",
    slotOpen: "Libre",
    slotSelected: "Sélectionné",
    slotFullCount: "2/2 complet",
    slotConfirmedCount: "confirmé",
    slotOpenCount: "libre",
    joinThisSlot: "Réserver ce créneau",
    scheduleFootnote: "20h00 sam. – 3h00 dim. est la tranche de nuit de l'équipe principale",
    modalTitle: "Réserver ce créneau",
    joining: "Réservation :",
    fullNamePlaceholder: "Nom complet",
    phonePlaceholder: "Numéro de téléphone",
    confirm: "Confirmer",
    submitting: "Envoi…",
    submitError: "Une erreur est survenue — veuillez réessayer.",
    modalFineprint:
      "Votre numéro de téléphone est réservé à l'organisateur et n'est jamais affiché sur la page. Votre inscription crée une réservation en attente pour cette heure.",
    thanksTitle: "Merci — nous confirmerons votre créneau sous peu",
    thanksPending: "En attente",
    thanksBody: "Votre nom apparaîtra sur le planning une fois confirmé par l'organisateur.",
    done: "Terminé",
    footerTagline: "Au profit de PCHF · Project Beyond Limits",
    footerDonate: "Faire un don",
    footerWatchLive: "Voir en direct",
    madePossibleBy: "Rendu possible par",
  },
};
