/** How many modules of quiet zone a QR code is drawn with, which a scanner needs to find it. */
export const QR_BORDER = 4;

/** How many modules wide each of a QR code's three finder patterns is. */
const FINDER_SIZE = 7;

/** The colours a QR code is drawn in: deep enough on light enough for any scanner to read. */
export interface QrColours {
	readonly paper: string;
	/** The data modules. */
	readonly ink: string;
	/** The three finder patterns in its corners, which are what the eye takes in first. */
	readonly finder: string;
}

/**
 * The app's colours for a QR code: a burnt orange on the passport's paper, with the corners nearer
 * the app's own orange. Both stay dark enough against the paper to scan as a black-on-white code
 * would; the app's orange itself is too light to.
 */
export const QR_COLOURS: QrColours = { finder: "#c2410c", ink: "#7c2d12", paper: "#fbf7ec" };

/** The top-left corner of each finder pattern, across and down, in a code `size` modules wide. */
const findersOf = (size: number, border: number): readonly (readonly [number, number])[] => [
	[border, border],
	[size - border - FINDER_SIZE, border],
	[border, size - border - FINDER_SIZE],
];

/** Whether the module at `left`, `top` is part of one of the finder patterns. */
const inFinder = (
	finders: readonly (readonly [number, number])[],
	left: number,
	top: number,
): boolean =>
	finders.some(
		([across, down]) =>
			left >= across && left < across + FINDER_SIZE && top >= down && top < down + FINDER_SIZE,
	);

/**
 * An SVG path drawing every dark module of a QR code as a unit square, so a whole code is a single
 * element, scaled by the `viewBox` of the SVG it sits in. Modules for which `skip` is true are
 * left out.
 */
export const qrPathOf = (
	modules: readonly (readonly boolean[])[],
	skip: (left: number, top: number) => boolean = () => false,
): string =>
	modules
		.flatMap((row, top) =>
			row.flatMap((dark, left) =>
				dark && !skip(left, top) ? [`M${String(left)} ${String(top)}h1v1h-1z`] : [],
			),
		)
		.join("");

/**
 * A finder pattern drawn whole, softened at its corners: a ring one module thick round a light
 * one, round a solid square three modules wide, as the square modules it replaces would be.
 */
const finderOf = ([left, top]: readonly [number, number], colour: string): string =>
	[
		`<rect x="${String(left + 0.5)}" y="${String(top + 0.5)}" width="6" height="6" rx="1.6" fill="none" stroke="${colour}"/>`,
		`<rect x="${String(left + 2)}" y="${String(top + 2)}" width="3" height="3" rx="0.8" fill="${colour}"/>`,
	].join("");

/**
 * A QR code as a standalone SVG document, one unit to a module, in `colours`: its data modules
 * square, and its three finder patterns rounded. `border` is the quiet zone round it, in modules,
 * which is where the finder patterns start.
 */
export const qrSvgOf = (
	modules: readonly (readonly boolean[])[],
	border: number,
	colours: QrColours = QR_COLOURS,
): string => {
	const size = modules.length;
	const finders = findersOf(size, border);
	return [
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${String(size)} ${String(size)}">`,
		`<rect width="${String(size)}" height="${String(size)}" fill="${colours.paper}"/>`,
		`<path d="${qrPathOf(modules, (left, top) => inFinder(finders, left, top))}" fill="${colours.ink}" shape-rendering="crispEdges"/>`,
		...finders.map((finder) => finderOf(finder, colours.finder)),
		"</svg>",
	].join("");
};
