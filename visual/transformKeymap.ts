import { parse, stringify } from "https://deno.land/std@0.205.0/yaml/mod.ts";

export interface Keymap {
	layout: Layout;
	layers: Layers;
}

export interface Layers {
	default: Array<Array<BaseClass | string>>;
	lower: Array<Array<LowerClass | string>>;
	raise: Array<Array<LowerClass | string>>;
}

export interface BaseClass {
	t: string;
	h?: string;
	s?: string;
}

export interface LowerClass {
	t?: string;
	type: Type;
}

export enum Type {
	Held = "held",
	Trans = "trans",
}

export interface Layout {
	qmk_keyboard: string;
	qmk_layout: string;
}

const keymap = parse(
	Deno.readTextFileSync("./visual/corne_keymap.yaml")
) as Keymap;

console.log(keymap);

const getBase = (key: BaseClass | LowerClass | string) => {
	if (typeof key === "string") {
		return key;
	}
	if ("type" in key) return "";
	return key.t ?? "";
};

const getTop = (key: BaseClass | string) => {
	if (typeof key === "string") {
		return key;
	}
	return key.s ?? key.h ?? "";
};

const normalize = (string: string) =>
	convertToAsciiSymbol(
		string.trim().replace("RA(GRAVE)", "´").replace("RA(UNDERSCORE)", "–")
	);

/* converts all words of this svg to ascii symbols:
./visual/keymap.svg
*/
const convertToAsciiSymbol = (key: string) => {
	switch (key) {
		case "RA(GRAVE)":
			return "´";
		case "RA(UNDERSCORE)":
			return "–";
		case "SPACE":
			return "␣";
		case "RIGHT ALT":
			return "⌥";
		case "RIGHT CONTROL":
			return "⌃";
		case "RIGHT ARROW":
			return "→";
		case "LEFT ARROW":
			return "←";
		case "UP ARROW":
			return "↑";
		case "DOWN ARROW":
			return "↓";
		case "BACKSPACE":
			return "⌫";
		case "ESCAPE":
			return "esc";
		case "TAB":
			return "⇥";
		case "ENTER":
			return "⏎";
		case "LEFT COMMAND":
			return "⌘";
		case "RIGHT COMMAND":
			return "⌘";
		case "LSHFT":
			return "⇧";
		case "RSHFT":
			return "⇧";
		case "&spotlight":
			return "🔍";
		case "Lower":
			// symbol for layer switching up
			return "═↑";
		case "Raise":
			return "";

		default:
			return key;
	}
};
keymap.layers.default.forEach((row, rowIndex) => {
	row.forEach((key, keyIndex) => {
		const newKey: BaseClass = {
			t: normalize(getBase(key)),
			s: normalize(getTop(key).trim()),
		};

		const left = getBase(keymap.layers.lower[rowIndex][keyIndex]);
		const right = getBase(keymap.layers.raise[rowIndex][keyIndex]);

		if (left) {
			newKey.s = normalize(`${left} ${right}`);
		}

		if (newKey.s === newKey.t) delete newKey.s;

		keymap.layers.default[rowIndex][keyIndex] = newKey;
	});
});

keymap.layers = {
	default: keymap.layers.default.flat().filter(({ t }) => t), //.map((row) => row.slice(1, -1)),
};

keymap.layout = {
	qmk_keyboard: "corne_rotated",
	qmk_layout: "LAYOUT_split_3x5_3",
};

console.log(keymap.layers);

Deno.writeTextFileSync("./visual/transformed_keymap.yaml", stringify(keymap));
