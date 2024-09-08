import { parse } from "@std/yaml";
import { ensureDirSync } from "@std/fs";

const keymapYaml = parse(Deno.readTextFileSync("./keymap.yaml")) as {
	baseLayer: string[][];
	codeLayer: string[][];
	codeLayerShift: string[][];
};

const kpLookup: Record<string, string> = {
	N1: "1",
	N2: "2",
	N3: "3",
	N4: "4",
	N5: "5",
	N6: "6",
	N7: "7",
	N8: "8",
	N9: "9",
	N0: "0",
	BACKSPACE: "⌫",
	ENTER: "↵",
	SPACE: "␣",
	ESCAPE: "esc",
	TAB: "⇥",
	RIGHT_ARROW: "→",
	LEFT_ARROW: "←",
	UP_ARROW: "↑",
	DOWN_ARROW: "↓",
	RIGHT_CONTROL: "⌃",
	RIGHT_ALT: "⌥",
	RSHFT: "⇧",
	RIGHT_COMMAND: "⌘",
	LEFT_CONTROL: "⌃",
	LEFT_ALT: "⌥",
	LSHFT: "⇧",
	LEFT_COMMAND: "⌘",
	SINGLE_QUOTE: "'",
	DOUBLE_QUOTES: '"',
	COMMA: ",",
	DOT: ".",
	QUESTION: "?",
	UNDERSCORE: "_",
	SLASH: "/",
	BACKSLASH: "\\",
	LESS_THAN: "&lt;",
	GREATER_THAN: "&gt;",
	LEFT_PARENTHESIS: "(",
	RIGHT_PARENTHESIS: ")",
	LEFT_BRACKET: "[",
	RIGHT_BRACKET: "]",
	LEFT_BRACE: "{",
	RIGHT_BRACE: "}",
	EXCLAMATION: "!",
	ASTERISK: "*",
	PLUS: "+",
	EQUAL: "=",
	MINUS: "-",
	COLON: ":",
	SEMICOLON: ";",
	AT: "@",
	HASH: "#",
	DOLLAR: "$",
	PERCENT: "%",
	CARET: "^",
	AMPERSAND: "&amp;",
	PIPE: "|",
	TILDE: "~",
	GRAVE: "`",
	"RA(GRAVE)": "´",
	"RA(UNDERSCORE)": "–",
};

const keyToReadable = (key: string) => {
	if (key === "none") return "";
	if (key === "trans") return "";
	if (key === "cmd_spot LEFT_COMMAND 0") return "⌘ 🔍";
	if (key === "mo 1") return "═↑";

	if (key.startsWith("kp ")) {
		const readable = key.slice(3);
		return kpLookup[readable] ?? readable;
	}

	return key;
};

const createKey = ({
	row,
	col,
	main,
	top,
}: {
	row: number;
	col: number;
	main: string;
	top: string;
}) => {
	const x = col * 50;
	const y = row * 50;

	return `<rect x="${x}" y="${y}" width="40" height="40" fill="#ccccdd44" rx="5" />
    <text x="${x + 20}" y="${y + 25}" 
        dominant-baseline="middle" text-anchor="middle">${main}</text>
    <text x="${x + 20}" y="${y + 10}" 
        dominant-baseline="middle" text-anchor="middle" font-size="10" xml:space="preserve">${top}</text>
    `;
};

const content = keymapYaml.baseLayer
	.map((row, rowIndex) =>
		row.map((mainKey, colIndex) => {
			let col = colIndex;
			if (rowIndex !== 3 && colIndex > 4) {
				col = colIndex + 1; // add gap in the middle
			}
			if (rowIndex === 3) {
				col = colIndex + 2.5; // center last row
			}

			const top = keymapYaml.codeLayer[rowIndex][colIndex];
			const topShift = keymapYaml.codeLayerShift[rowIndex][colIndex];

			const topKey = ["none", "trans"].includes(topShift)
				? keyToReadable(top)
				: `${keyToReadable(top)}    ${keyToReadable(topShift)}`;

			return createKey({
				row: rowIndex,
				col: col,
				main: keyToReadable(mainKey),
				top: topKey,
			});
		})
	)
	.flat()
	.join("\n");

const createSVG = (content: string) => `
<svg xmlns="http://www.w3.org/2000/svg"
  width="${50 * 11}" height="${50 * 4}">
  <g font-family="Arial" font-size="12">
    ${content}
    </g>
</svg>`;

ensureDirSync("../visual");
Deno.writeTextFileSync("../visual/keymap.svg", createSVG(content));
