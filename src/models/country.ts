export interface Country {
	readonly name: string;
	readonly iso3166: string;
	// The UN M49 region, such as "Americas", and the most specific grouping M49 gives inside it:
	// its intermediate region where it has one, such as "South America", otherwise its sub-region.
	readonly region: string;
	readonly subregion: string;
	readonly bounds?: readonly [number, number, number, number];
	readonly selected?: boolean;
}

// What is kept about a country the reader has been to, keyed by its ISO 3166-1 alpha-2 code. A
// visit has no details yet; it is an object so that details of the trip can be added later without
// changing how selections are stored.
export type Visit = Readonly<Record<string, never>>;
export type Visits = Readonly<Record<string, Visit>>;
