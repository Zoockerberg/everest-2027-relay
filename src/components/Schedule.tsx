import { forwardRef } from "react";
import { buildDays } from "../lib/schedule";

interface ScheduleProps {
  selected: string | null;
  onSlotClick: (key: string, isSelected: boolean) => void;
}

const Schedule = forwardRef<HTMLElement, ScheduleProps>(function Schedule(
  { selected, onSlotClick },
  ref,
) {
  const days = buildDays();

  return (
    <section className="schedule" ref={ref}>
      <div className="schedule__inner">
        <h2 className="h2">Take an hour</h2>
        <p className="schedule__intro">
          22 public slots, two skiers per hour. Pick the hour you want — the organiser confirms
          you before your name goes on the board.
        </p>

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
                    ? "Selected"
                    : "Open";
                const countText = slot.isFull
                  ? "2/2 full"
                  : `${slot.names.length}/2 ${slot.names.length === 0 ? "open" : "confirmed"}`;

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
                    {isSel && <span className="slot-card__join">Join this slot</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="schedule__footnote">
          8:00pm Sat – 3:00am Sun is the core team&rsquo;s overnight stretch
        </div>
      </div>
    </section>
  );
});

export default Schedule;
