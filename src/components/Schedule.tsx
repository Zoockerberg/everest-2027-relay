import { forwardRef } from "react";
import { buildDays } from "../lib/schedule";
import { useLanguage } from "../i18n/LanguageContext";

interface ScheduleProps {
  selected: string | null;
  onSlotClick: (key: string, isSelected: boolean) => void;
}

const Schedule = forwardRef<HTMLElement, ScheduleProps>(function Schedule(
  { selected, onSlotClick },
  ref,
) {
  const { lang, t } = useLanguage();
  const days = buildDays(lang, t);

  return (
    <section className="schedule" ref={ref}>
      <div className="schedule__inner">
        <h2 className="h2">{t.scheduleHeading}</h2>
        <p className="schedule__intro">{t.scheduleIntro}</p>

        {days.map((day) => (
          <div className="day-group" key={day.label}>
            <div className="day-group__header">
              <span className="day-group__label">{day.label}</span>
              <span className="day-group__window">{day.window}</span>
            </div>
            <div className="slot-grid">
              {day.slots.map((slot) => {
                const isSel = selected === slot.key;
                const namesText = slot.names.length
                  ? slot.names.join(" · ")
                  : isSel
                    ? t.slotSelected
                    : t.slotOpen;
                const countText = slot.isFull
                  ? t.slotFullCount
                  : `${slot.names.length}/2 ${slot.names.length === 0 ? t.slotOpenCount : t.slotConfirmedCount}`;

                return (
                  <button
                    key={slot.key}
                    type="button"
                    disabled={slot.isFull}
                    onClick={() => onSlotClick(slot.key, isSel)}
                    className={`slot-card${isSel ? " slot-card--selected" : ""}${slot.isFull ? " slot-card--full" : ""}`}
                  >
                    <span className="slot-card__top">
                      <span className="slot-card__time">{slot.time}</span>
                      <span className="slot-card__count">{countText}</span>
                    </span>
                    <span className="slot-card__names">{namesText}</span>
                    {isSel && <span className="slot-card__join">{t.joinThisSlot}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="schedule__footnote">{t.scheduleFootnote}</div>
      </div>
    </section>
  );
});

export default Schedule;
