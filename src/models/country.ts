export interface Country {
	readonly name: string;
	readonly iso3166: string;
	readonly region: string;
	readonly bounds?: readonly [number, number, number, number];
	readonly selected?: boolean;
}
