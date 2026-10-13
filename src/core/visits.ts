import type { Visit, Visits } from "./types.ts";

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

/** An ISO 8601 calendar date, such as "2026-10-13". */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/u;

const isVisit = (value: unknown): value is Visit =>
	isRecord(value) &&
	Object.keys(value).every((key) => key === "at") &&
	(value["at"] === undefined || (typeof value["at"] === "string" && ISO_DATE.test(value["at"])));

/** Whether a value read back from storage has the shape the app stores visits in today. */
export const isVisits = (value: unknown): value is Visits =>
	isRecord(value) && Object.values(value).every((visit) => isVisit(visit));

/** A visit made on `date`, dated by the reader's own calendar rather than UTC. */
export const visitOn = (date: Date): Visit => ({
	at: [date.getFullYear(), date.getMonth() + 1, date.getDate()]
		.map((part, index) => String(part).padStart(index === 0 ? 4 : 2, "0"))
		.join("-"),
});

export const withoutVisit = (visits: Visits, code: string): Visits =>
	Object.fromEntries(Object.entries(visits).filter(([other]) => other !== code));
