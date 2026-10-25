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
      "Every dollar donated helps WA's sick kids at Perth Children's Hospital — and pushes us further across 24 hours of non-stop skiing.",
    raisedSoFar: "raised so far",
    startsIn: "Starts in",
    countdownUnits: "dd : hh : mm",
    donateNow: "Donate Now",
    watchLive: "Watch Live",
    iWantToSki: "I want to Ski!",
    statDate: "14–15 Nov",
    statHourCap: "24 hour challenge",
    statChip: "100% to PCHF",
    inSupportOf: "In support of",
    aboutHeading: "The challenge",
    aboutP1:
      "100 km on the SkiErg is just the baseline. We ski non-stop for 24 hours in relay — two-person rotations with day volunteers, then a dedicated duo through the night until 6am.",
    aboutP2:
      "Donations push the distance further. Every dollar raised adds metres to the target, so the final number on the board is set by the people watching, not by us. Hit $5,000 and we aim for 240km.",
    aboutP3:
      "All proceeds go to PCHF's Everest 2027 Project Beyond Limits campaign. Nothing is processed on this site — donations are handled entirely on PCHF's own fundraising page.",
    scheduleHeading: "Take an hour",
    scheduleIntro:
      "Join us on the challenge! Pick the hour you want, we'll put your name on the board and invite you to the WhatsApp group.",
    daySaturday: "Saturday 14 Nov",
    daySunday: "Sunday 15 Nov",
    dayAbbrSat: "Sat",
    dayAbbrSun: "Sun",
    slotOpen: "Open",
    slotSelected: "Selected",
    slotFullCount: "2/2 full",
    slotConfirmedCount: "confirmed",
    slotOpenCount: "open",
    joinThisSlot: "Join this slot",
    scheduleFootnote: "8:00pm Sat – 3:00am Sun is the core team's overnight stretch · Event ends 6:00am Sun",
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
      "Chaque dollar donné aide les enfants malades d'Australie-Occidentale à l'hôpital pour enfants de Perth — et nous pousse plus loin encore sur 24 heures de ski non-stop.",
    raisedSoFar: "récoltés à ce jour",
    startsIn: "Départ dans",
    countdownUnits: "jj : hh : mm",
    donateNow: "Faire un don",
    watchLive: "Voir en direct",
    iWantToSki: "Je veux skier !",
    statDate: "14–15 nov.",
    statHourCap: "24 heures non-stop",
    statChip: "100 % pour PCHF",
    inSupportOf: "Au profit de",
    aboutHeading: "Le défi",
    aboutP1:
      "100 km sur le SkiErg, c'est juste la base. On skie sans s'arrêter pendant 24 heures en relais — rotations de deux personnes en journée, puis un duo dédié la nuit jusqu'à 6h du matin.",
    aboutP2:
      "Les dons repoussent la distance plus loin. Chaque dollar récolté ajoute des mètres à l'objectif, donc le chiffre final affiché est fixé par ceux qui regardent, pas par nous. À 5 000 $, on vise les 240 km.",
    aboutP3:
      "Tous les fonds vont à la campagne Everest 2027 Project Beyond Limits de PCHF. Aucun paiement n'est traité sur ce site — les dons se font entièrement sur la page de collecte de PCHF.",
    scheduleHeading: "Réserve ton heure",
    scheduleIntro:
      "Rejoignez le défi ! Choisissez votre heure, on inscrit votre nom sur le tableau et on vous invite dans le groupe WhatsApp.",
    daySaturday: "Samedi 14 nov.",
    daySunday: "Dimanche 15 nov.",
    dayAbbrSat: "Sam",
    dayAbbrSun: "Dim",
    slotOpen: "Libre",
    slotSelected: "Sélectionné",
    slotFullCount: "2/2 complet",
    slotConfirmedCount: "confirmé",
    slotOpenCount: "libre",
    joinThisSlot: "Réserver ce créneau",
    scheduleFootnote: "20h00 sam. – 3h00 dim. est la tranche de nuit de l'équipe principale · Fin du défi à 6h00 dim.",
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
