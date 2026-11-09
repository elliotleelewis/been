import { useEffect } from "react";
import type { RefObject } from "react";

/**
 * How far past its square a stamp's ink can run, turned and roughened as it is, as a share of the
 * square; the picture taken of it is that much larger all round, so none of it is cut off.
 */
const BLEED = 0.1;
/** The square a stamp is drawn in, in SVG units. */
const STAMP_SIZE = 120;

/**
 * The markup of a stamp's SVG as a picture of its own: its square grown by the bleed, and the
 * page's font written onto it, which a picture cannot inherit.
 */
const pictureOf = (svg: SVGSVGElement): string => {
	const copy = svg.cloneNode(true);
	if (!(copy instanceof globalThis.SVGSVGElement)) {
		return "";
	}
	const bleed = STAMP_SIZE * BLEED;
	copy.removeAttribute("class");
	copy.setAttribute(
		"viewBox",
		`${String(-bleed)} ${String(-bleed)} ${String(STAMP_SIZE + bleed * 2)} ${String(STAMP_SIZE + bleed * 2)}`,
	);
	copy.setAttribute("font-family", globalThis.getComputedStyle(svg).fontFamily);
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new globalThis.XMLSerializer().serializeToString(copy))}`;
};

/** Shows `picture` in place of `svg`, once it is ready to draw, unless asked not to by then. */
const swapWhenReady = (
	svg: SVGSVGElement,
	picture: HTMLImageElement,
	isWanted: () => boolean,
): void => {
	picture
		.decode()
		.then(() => {
			if (isWanted()) {
				svg.after(picture);
				svg.style.display = "none";
			}
		})
		.catch((cause: unknown) => {
			console.warn("Could not take a picture of a stamp; it stays drawn.", cause);
		});
};

/**
 * Swaps the stamp drawn in `container` for a picture of it, once the picture is ready. A stamp's
 * ink is SVG noise, which Safari works out afresh whenever the passport around it is redrawn, as
 * it is every frame the passport tilts, and a page of them could not keep up; a picture is drawn
 * once. The SVG stays in place, hidden, so it is still what React renders into; whatever renders
 * it remounts it to have the picture taken again, such as when its country's outline arrives.
 */
export const useStampSnapshot = (container: RefObject<HTMLElement | null>): void => {
	useEffect(() => {
		const element = container.current;
		const svg = element?.querySelector("svg") ?? null;
		const picture = globalThis.document.createElement("img");
		let wanted = element !== null && svg !== null;
		if (element !== null && svg !== null) {
			picture.alt = "";
			picture.className =
				"pointer-events-none absolute top-[-10%] left-[-10%] size-[120%] max-w-none";
			picture.src = pictureOf(svg);
			swapWhenReady(svg, picture, () => wanted);
		}
		return (): void => {
			wanted = false;
			picture.remove();
			svg?.style.removeProperty("display");
		};
	}, [container]);
};
