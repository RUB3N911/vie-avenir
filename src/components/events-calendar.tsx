"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CalendarEvent = {
  id: string;
  slug: string;
  title: string;
  starts_at: string;
  venue_name: string | null;
  city: string;
};

type CalendarView = "calendar" | "list";

const martiniqueDateParts = new Intl.DateTimeFormat("fr-FR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "America/Martinique",
});

const martiniqueTime = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Martinique",
});

const monthLabel = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const dayLabel = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "America/Martinique",
});

const weekdays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function dateParts(value: string) {
  const parts = martiniqueDateParts.formatToParts(new Date(value));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { year: get("year"), month: get("month") - 1, day: get("day") };
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function EventsCalendar({ events, initialDate }: { events: CalendarEvent[]; initialDate?: string }) {
  const initial = dateParts(initialDate ?? events[0]?.starts_at ?? new Date().toISOString());
  const [visibleMonth, setVisibleMonth] = useState({ year: initial.year, month: initial.month });
  const [view, setView] = useState<CalendarView>("calendar");

  const monthEvents = useMemo(
    () => events.filter((event) => {
      const parts = dateParts(event.starts_at);
      return parts.year === visibleMonth.year && parts.month === visibleMonth.month;
    }),
    [events, visibleMonth],
  );

  const eventsByDay = useMemo(() => {
    const grouped = new Map<number, CalendarEvent[]>();
    monthEvents.forEach((event) => {
      const day = dateParts(event.starts_at).day;
      grouped.set(day, [...(grouped.get(day) ?? []), event]);
    });
    return grouped;
  }, [monthEvents]);

  const dayCount = new Date(Date.UTC(visibleMonth.year, visibleMonth.month + 1, 0)).getUTCDate();
  const leadingDays = (new Date(Date.UTC(visibleMonth.year, visibleMonth.month, 1)).getUTCDay() + 6) % 7;
  const days = Array.from({ length: dayCount }, (_, index) => index + 1);
  const label = monthLabel.format(new Date(Date.UTC(visibleMonth.year, visibleMonth.month, 1)));

  function changeMonth(offset: number) {
    const next = new Date(Date.UTC(visibleMonth.year, visibleMonth.month + offset, 1));
    setVisibleMonth({ year: next.getUTCFullYear(), month: next.getUTCMonth() });
  }

  return (
    <div className="events-calendar">
      <div className="events-calendar-toolbar">
        <div className="events-calendar-month-nav">
          <button type="button" onClick={() => changeMonth(-1)} aria-label="Afficher le mois précédent">←</button>
          <h3 aria-live="polite">{label}</h3>
          <button type="button" onClick={() => changeMonth(1)} aria-label="Afficher le mois suivant">→</button>
        </div>
        <div className="events-calendar-view" aria-label="Mode d’affichage">
          <button type="button" className={view === "calendar" ? "is-active" : undefined} aria-pressed={view === "calendar"} onClick={() => setView("calendar")}>Calendrier</button>
          <button type="button" className={view === "list" ? "is-active" : undefined} aria-pressed={view === "list"} onClick={() => setView("list")}>Liste</button>
        </div>
      </div>

      {view === "calendar" ? (
        <div className="events-calendar-grid" aria-label={`Calendrier de ${label}`}>
          {weekdays.map((weekday) => <span className="events-calendar-weekday" key={weekday}>{weekday}</span>)}
          {Array.from({ length: leadingDays }, (_, index) => <span className="events-calendar-blank" aria-hidden="true" key={`blank-${index}`} />)}
          {days.map((day) => {
            const dayEvents = eventsByDay.get(day) ?? [];
            return (
              <div className={`events-calendar-day ${dayEvents.length ? "has-events" : ""}`} key={`${monthKey(visibleMonth.year, visibleMonth.month)}-${day}`}>
                <span>{day}</span>
                <div>
                  {dayEvents.map((event) => (
                    <Link href={`/evenements/${event.slug}`} key={event.id}>
                      <time dateTime={event.starts_at}>{martiniqueTime.format(new Date(event.starts_at))}</time>
                      <strong>{event.title}</strong>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="events-calendar-agenda">
          {monthEvents.length ? monthEvents.map((event) => (
            <Link href={`/evenements/${event.slug}`} key={event.id}>
              <time dateTime={event.starts_at}>
                <strong>{dayLabel.format(new Date(event.starts_at))}</strong>
                <span>{martiniqueTime.format(new Date(event.starts_at))}</span>
              </time>
              <span><strong>{event.title}</strong><small>{event.venue_name ?? "Lieu à confirmer"} · {event.city}</small></span>
              <b aria-hidden="true">→</b>
            </Link>
          )) : <p>Aucun rendez-vous prévu pour ce mois.</p>}
        </div>
      )}
    </div>
  );
}
