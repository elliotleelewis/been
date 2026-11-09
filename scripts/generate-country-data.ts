// Regenerates the two files that tie the app's country list to the boundaries the map draws:
//
//   src/data/boundary-codes.ts - Natural Earth's alpha-3 keys, translated to ISO 3166-1 alpha-2
//   src/data/countries.ts      - the same list, with `bounds`, `centre` and `area` taken from those
//                                boundaries, and the countries each shares a land border with
//
// Run it with `pnpm run generate:countries` after bumping `visionscarto-world-atlas`. The country
// list is the input, not the output: a country the atlas cannot draw fails the run rather than
// quietly disappearing, so dropping one is always a deliberate edit to src/data/countries.ts.
//
// That list is the 193 member states of the United Nations and its two observer states, the Holy
// See and Palestine, each with the codes of its UN M49 region and sub-region. Territories are left
// out, so the atlas draws them but nothing can select them. Nothing in the list is a name: the app
// names countries in the reader's language with `Intl.DisplayNames`, so the run fails on any code
// that has no name there rather than letting it reach the reader as a bare code.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import isoCountries from "i18n-iso-countries";
import { neighbors } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";

import type { CountryData } from "../src/core/types.ts";
import { OVERSEAS_BORDERS, boundsOf, toBoundaries } from "../src/data/boundaries.ts";
import type { Bounds } from "../src/data/boundaries.ts";
import { countries } from "../src/data/countries.ts";
import { centreOf, landAreaOf } from "../src/data/land.ts";

const resolve = (path: string): string => fileURLToPath(new globalThis.URL(path, import.meta.url));

const ATLAS_PATH = resolve("../node_modules/visionscarto-world-atlas/world/50m.json");
const CODES_PATH = resolve("../src/data/boundary-codes.ts");
const COUNTRIES_PATH = resolve("../src/data/countries.ts");

type BoundedCountry = CountryData & {
	readonly area: number;
	readonly bounds: Bounds;
	readonly centre: readonly [number, number];
	readonly neighbours: readonly string[];
};

// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- A file installed from npm, not untrusted input.
const readAtlas = (): Topology => JSON.parse(readFileSync(ATLAS_PATH, "utf8")) as Topology;

/** The atlas's country shapes, which it keeps as one collection. */
const geometriesOf = (topology: Topology): GeometryCollection["geometries"] => {
	const object = topology.objects["countries"];
	if (object?.type !== "GeometryCollection") {
		throw new Error("The world atlas has no `countries` collection.");
	}
	return object.geometries;
};

const alpha3sOf = (topology: Topology): readonly string[] =>
	geometriesOf(topology).flatMap((geometry) => {
		const properties: Readonly<Record<string, unknown>> = geometry.properties ?? {};
		const alpha3 = properties["a3"];
		return typeof alpha3 === "string" ? [alpha3] : [];
	});

/**
 * The countries each listed country shares a land border with, by code: those whose shapes in the
 * atlas share an edge, less the borders only an overseas territory makes, and those with
 * territories nothing lists.
 */
const toNeighbours = (
	topology: Topology,
	codes: Readonly<Record<string, string>>,
): ReadonlyMap<string, readonly string[]> => {
	const geometries = geometriesOf(topology);
	const codeOf = (index: number): string | undefined => {
		const alpha3: unknown = geometries[index]?.properties?.["a3"];
		return typeof alpha3 === "string" ? codes[alpha3] : undefined;
	};
	const overseas = new Set(
		OVERSEAS_BORDERS.flatMap(([one, other]) => [`${one}:${other}`, `${other}:${one}`]),
	);
	const neighbours = new Map<string, Set<string>>();
	for (const [index, others] of neighbors(geometries).entries()) {
		const code = codeOf(index);
		for (const other of others.map((neighbour) => codeOf(neighbour))) {
			if (
				code !== undefined &&
				other !== undefined &&
				other !== code &&
				!overseas.has(`${code}:${other}`)
			) {
				neighbours.set(code, (neighbours.get(code) ?? new Set()).add(other));
			}
		}
	}
	return new Map([...neighbours].map(([code, others]) => [code, [...others].toSorted()]));
};

/** Only the countries the app lists, so a code the app does not track can never reach the map. */
const toCodes = (topology: Topology): Readonly<Record<string, string>> => {
	const tracked = new Set(countries.map(({ iso3166 }) => iso3166));
	const codes: Record<string, string> = {};
	for (const alpha3 of alpha3sOf(topology)) {
		const iso3166 = isoCountries.alpha3ToAlpha2(alpha3);
		if (iso3166 !== undefined && tracked.has(iso3166)) {
			codes[alpha3] = iso3166;
		}
	}
	return codes;
};

const withBounds = (
	topology: Topology,
	codes: Readonly<Record<string, string>>,
): readonly BoundedCountry[] => {
	const boundaries = new Map(
		toBoundaries(topology, codes).features.map((boundary) => [
			boundary.properties.iso_3166_1,
			boundary,
		]),
	);

	const missing = countries.filter(({ iso3166 }) => !boundaries.has(iso3166));
	if (missing.length > 0) {
		throw new Error(
			`Natural Earth has no geometry for ${missing.length} of the listed countries: ` +
				`${missing.map(({ iso3166 }) => iso3166).join(", ")}. Either the ` +
				`atlas changed shape, or these need removing from src/data/countries.ts.`,
		);
	}

	const neighbours = toNeighbours(topology, codes);
	return countries.map(({ iso3166, region, subregion }) => {
		const boundary = boundaries.get(iso3166);
		if (boundary === undefined) {
			throw new Error(`No boundary for ${iso3166}.`);
		}
		const [longitude, latitude] = centreOf(boundary);
		return {
			area: Math.round(landAreaOf(boundary)),
			bounds: boundsOf(boundary),
			centre: [Number(longitude.toFixed(2)), Number(latitude.toFixed(2))],
			iso3166,
			neighbours: neighbours.get(iso3166) ?? [],
			region,
			subregion,
		};
	});
};

const serializeCodes = (codes: Readonly<Record<string, string>>): string =>
	[
		"/**",
		" * Generated by `pnpm run generate:countries`. Do not edit by hand.",
		" * Maps Natural Earth's alpha-3 country keys to the ISO 3166-1 alpha-2 codes the app uses.",
		" */",
		"export const boundaryCodes: Readonly<Record<string, string>> = {",
		...Object.keys(codes)
			.toSorted()
			.map((alpha3) => `\t${alpha3}: ${JSON.stringify(codes[alpha3])},`),
		"};",
		"",
	].join("\n");

/** Digits grouped in threes, as the linter asks of a number five or more digits long. */
const DIGIT_GROUPS = /\B(?=(?:\d{3})+$)/gu;
const GROUPED_FROM = 10_000;

/** A whole number as source code, its digits grouped where the linter asks for it. */
const serializeWhole = (value: number): string =>
	value < GROUPED_FROM ? String(value) : String(value).replaceAll(DIGIT_GROUPS, "_");

const serializeCountries = (values: readonly BoundedCountry[]): string =>
	[
		"// oxlint-disable max-lines -- A static dataset of every country, not code to be split up.",
		"// Bounds, centres and areas are generated by `pnpm run generate:countries`; edit that script, not these numbers.",
		'import type { CountryData } from "../core/types.ts";',
		"",
		"export const countries: readonly CountryData[] = [",
		...values.map(({ area, bounds, centre, iso3166, neighbours, region, subregion }) =>
			[
				"\t{",
				`\t\tarea: ${serializeWhole(area)},`,
				`\t\tbounds: [${bounds.join(", ")}],`,
				`\t\tcentre: [${centre.join(", ")}],`,
				`\t\tiso3166: ${JSON.stringify(iso3166)},`,
				...(neighbours.length === 0 ? [] : [`\t\tneighbours: ${JSON.stringify(neighbours)},`]),
				`\t\tregion: ${JSON.stringify(region)},`,
				`\t\tsubregion: ${JSON.stringify(subregion)},`,
				"\t},",
			].join("\n"),
		),
		"];",
		"",
	].join("\n");

const assertNamed = (): void => {
	const names = new Intl.DisplayNames(["en"], { fallback: "none", type: "region" });
	const unnamed = countries
		.map(({ iso3166 }) => iso3166)
		.filter((code) => names.of(code) === undefined);
	if (unnamed.length > 0) {
		throw new Error(`\`Intl.DisplayNames\` has no name for ${unnamed.join(", ")}.`);
	}
};

assertNamed();
const atlas = readAtlas();
const codes = toCodes(atlas);
const bounded = withBounds(atlas, codes);

writeFileSync(CODES_PATH, serializeCodes(codes));
writeFileSync(COUNTRIES_PATH, serializeCountries(bounded));

console.warn(`Wrote ${Object.keys(codes).length} boundary codes and ${bounded.length} countries.`);
