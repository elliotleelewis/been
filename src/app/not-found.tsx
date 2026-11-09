import { Navigate } from "@tanstack/react-router";
import { memo } from "react";
import type { FC } from "react";

/** A path with no page at it, which goes to the map rather than to a dead end. */
export const NotFound: FC = memo(() => <Navigate to="/" replace />);
NotFound.displayName = "NotFound";
