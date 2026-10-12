/**
 * An SVG path drawing every dark module of a QR code as a unit square, so a whole code is a single
 * element, scaled by the `viewBox` of the SVG it sits in.
 */
export const qrPathOf = (modules: readonly (readonly boolean[])[]): string =>
	modules
		.flatMap((row, top) =>
			row.flatMap((dark, left) => (dark ? [`M${String(left)} ${String(top)}h1v1h-1z`] : [])),
		)
		.join("");

/** A QR code as a standalone SVG document, black on white, one unit to a module. */
export const qrSvgOf = (modules: readonly (readonly boolean[])[]): string => {
	const size = String(modules.length);
	return [
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">`,
		`<rect width="${size}" height="${size}" fill="#fff"/>`,
		`<path d="${qrPathOf(modules)}" fill="#000"/>`,
		"</svg>",
	].join("");
};
