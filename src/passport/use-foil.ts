import { useEffect } from "react";
import type { RefObject } from "react";

import {
	RESTING_FOIL,
	driftingFoilAt,
	foilOfDevice,
	foilOfPointer,
	foilPropertiesOf,
	foilTowards,
} from "./foil.ts";
import type { Foil } from "./foil.ts";

/** What is steering the light, the pointer winning over the device. */
type Steer = "device" | "drift" | "pointer";

/** The light as it plays out: where it is, where it is headed, and why. */
interface FoilState {
	current: Foil;
	target: Foil;
	steer: Steer;
	/** How the device was held when it first reported, which tipping it is measured from. */
	restingBeta: number | undefined;
}

/** Writes the light onto the element as the custom properties its styles read. */
const paint = (element: HTMLElement, foil: Foil): void => {
	for (const [name, value] of Object.entries(foilPropertiesOf(foil))) {
		element.style.setProperty(name, value);
	}
};

/** Takes the light off the element again, back to the resting light its styles default to. */
const unpaint = (element: HTMLElement): void => {
	for (const name of Object.keys(foilPropertiesOf(RESTING_FOIL))) {
		element.style.removeProperty(name);
	}
};

/** Follows the pointer over the element while it is there, and lets go when it leaves. */
const steerByPointer = (element: HTMLElement, state: FoilState): (() => void) => {
	const move = ({ clientX, clientY }: PointerEvent): void => {
		const { height, left, top, width } = element.getBoundingClientRect();
		state.steer = "pointer";
		state.target = foilOfPointer([left, top, width, height], [clientX, clientY]);
	};
	const leave = (): void => {
		state.steer = state.restingBeta === undefined ? "drift" : "device";
	};
	element.addEventListener("pointermove", move);
	element.addEventListener("pointerleave", leave);
	return () => {
		element.removeEventListener("pointermove", move);
		element.removeEventListener("pointerleave", leave);
	};
};

/** Follows the tilt of the device, where it reports one, unless the pointer is steering. */
const steerByDevice = (state: FoilState): (() => void) => {
	const tilt = ({ beta, gamma }: DeviceOrientationEvent): void => {
		if (beta === null || gamma === null || state.steer === "pointer") {
			return;
		}
		state.restingBeta ??= beta;
		state.steer = "device";
		state.target = foilOfDevice(gamma, beta, state.restingBeta);
	};
	globalThis.addEventListener("deviceorientation", tilt);
	return () => {
		globalThis.removeEventListener("deviceorientation", tilt);
	};
};

/** Eases the light towards its target every frame, drifting it while nothing steers it. */
const animate = (element: HTMLElement, state: FoilState): (() => void) => {
	let frame = 0;
	let last = Number.NaN;
	const step = (time: number): void => {
		if (state.steer === "drift") {
			state.target = driftingFoilAt(time);
		}
		state.current = foilTowards(state.current, state.target, Number.isNaN(last) ? 0 : time - last);
		last = time;
		paint(element, state.current);
		frame = globalThis.requestAnimationFrame(step);
	};
	frame = globalThis.requestAnimationFrame(step);
	return () => {
		globalThis.cancelAnimationFrame(frame);
	};
};

/**
 * Lights the element while `enabled`, and tilts it towards the light: the light follows the
 * pointer over it, or the tilt of the device it is held in, or drifts slowly, lying flat, while
 * neither is steering, and always eases from one to the next, so it never jumps. It is written
 * straight onto the element as custom properties, every frame, rather than through React, and the
 * foil visas inside inherit them. A reader who has asked for less motion gets the resting light.
 */
export const useFoil = (ref: RefObject<HTMLElement | null>, enabled: boolean): void => {
	useEffect(() => {
		const element = ref.current;
		const reduced = globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const state: FoilState = {
			current: RESTING_FOIL,
			restingBeta: undefined,
			steer: "drift",
			target: RESTING_FOIL,
		};
		const stops =
			!enabled || element === null || reduced
				? []
				: [steerByPointer(element, state), steerByDevice(state), animate(element, state)];
		return (): void => {
			for (const stop of stops) {
				stop();
			}
			if (element !== null) {
				unpaint(element);
			}
		};
	}, [enabled, ref]);
};

/**
 * Asks to read the device's tilt, which iOS only reports once asked from a tap; elsewhere it is
 * reported unasked, and this does nothing. Whatever the answer, the light still drifts without it.
 */
export const askForDeviceTilt = (): void => {
	const ask: unknown =
		"DeviceOrientationEvent" in globalThis
			? Reflect.get(globalThis.DeviceOrientationEvent, "requestPermission")
			: undefined;
	if (typeof ask === "function") {
		Promise.resolve(Reflect.apply(ask, globalThis.DeviceOrientationEvent, [])).catch(
			(cause: unknown) => {
				console.warn("Could not read the device's tilt.", cause);
			},
		);
	}
};
