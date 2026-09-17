import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Hero from "./components/Hero";
import About from "./components/About";
import Schedule from "./components/Schedule";
import JoinModal from "./components/JoinModal";
import ThanksModal from "./components/ThanksModal";
import Footer from "./components/Footer";
import { parseSlotKey, selectionLabel } from "./lib/schedule";
import { fetchConfirmedSlots, submitRegistration } from "./lib/api";
import { FALLBACK_CONFIRMED } from "./config";
import { useLanguage } from "./i18n/LanguageContext";

export default function App() {
  const { lang, t } = useLanguage();
  const scheduleRef = useRef<HTMLElement>(null);

  const [confirmed, setConfirmed] = useState(FALLBACK_CONFIRMED);
  const [selected, setSelected] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    fetchConfirmedSlots().then(setConfirmed);
  }, []);

  const ready = !!selected && name.trim().length > 1 && phone.trim().length > 5;

  const scrollToSchedule = () => {
    if (!scheduleRef.current) return;
    window.scrollTo({ top: scheduleRef.current.offsetTop - 12, behavior: "smooth" });
  };

  const handleSlotClick = (key: string, isSelected: boolean) => {
    if (isSelected) {
      setModalOpen(true);
      return;
    }
    setSelected(key);
    setModalOpen(false);
    setSubmitted(null);
    setSubmitError(false);
  };

  const handleSubmit = async () => {
    if (!ready || !selected || submitting) return;
    setSubmitting(true);
    setSubmitError(false);
    const { date, startTime } = parseSlotKey(selected);
    const ok = await submitRegistration({ date, startTime, name: name.trim(), phone: phone.trim() });
    setSubmitting(false);
    if (!ok) {
      setSubmitError(true);
      return;
    }
    setSubmitted(selected);
    setSelected(null);
    setModalOpen(false);
    setName("");
    setPhone("");
  };

  return (
    <>
      <Hero onSkiClick={scrollToSchedule} />
      <About />
      <Schedule ref={scheduleRef} selected={selected} onSlotClick={handleSlotClick} confirmed={confirmed} />
      <Footer />

      {modalOpen && !submitted && selected && (
        <JoinModal
          selectionLabel={selectionLabel(selected, lang, t)}
          name={name}
          phone={phone}
          onChangeName={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          onChangePhone={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          submitDisabled={!ready}
          submitting={submitting}
          error={submitError}
        />
      )}

      {submitted && <ThanksModal submittedKey={submitted} onDone={() => setSubmitted(null)} />}
    </>
  );
}
