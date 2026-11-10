import { useRouter } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

import { shareHashOf } from "../core/share-link.ts";
import { shareValueAtom } from "./share.ts";

/**
 * The link that opens the reader's own map, read-only, for whoever they send it to: the map's page
 * with the map in its hash, as the router builds it, made whole with the site's origin.
 */
export const useShareUrl = (): string => {
	const router = useRouter();
	const value = useAtomValue(shareValueAtom);
	return useMemo(
		() =>
			new globalThis.URL(
				router.buildLocation({ hash: shareHashOf(value), to: "/" }).href,
				globalThis.location.origin,
			).toString(),
		[router, value],
	);
};
