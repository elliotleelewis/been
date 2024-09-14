export interface Country {
	name: string;
	iso3166: string;
	region: string;
	bounds?: [number, number, number, number];
	selected?: boolean;
}
