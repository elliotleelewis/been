import type { Visit, Visits } from "../models/country";

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

const isVisit = (value: unknown): value is Visit =>
	isRecord(value) && Object.keys(value).length === 0;

// Whether a value read back from storage has the shape the app stores visits in today.
export const isVisits = (value: unknown): value is Visits =>
	isRecord(value) && Object.values(value).every((visit) => isVisit(visit));

export const withoutVisit = (visits: Visits, code: string): Visits =>
	Object.fromEntries(Object.entries(visits).filter(([other]) => other !== code));
