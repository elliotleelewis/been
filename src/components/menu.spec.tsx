import { render } from "@testing-library/react";
import { Provider } from "jotai";
import { describe, expect, it, vi } from "vitest";
import type { Country } from "@/models/country";
import { rawCountriesAtom } from "@/state/atoms";
import { HydrateAtoms } from "@/utils/test";
import { Menu } from "./menu";

const country: Country = {
	iso3166: "GB",
	name: "United Kingdom",
	region: "Europe",
};

describe("menu", () => {
	it("should render", () => {
		const result = render(
			<Provider>
				<HydrateAtoms initialValues={[[rawCountriesAtom, { [country.iso3166]: country }]]}>
					<Menu fullscreen={false} toggleFullscreen={vi.fn<() => void>()} />
				</HydrateAtoms>
			</Provider>,
		);

		expect(result.asFragment()).toMatchSnapshot();
	}, 5000);
});
