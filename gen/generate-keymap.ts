const layerA = [
	[
		"&kp N1",
		"&kp N2",
		"&kp N3",
		"&kp N4",
		"&kp N5",
		"&kp LEFT_BRACE",
		"&kp LEFT_BRACKET",
		"&kp LEFT_PARENTHESIS",
		"&kp LESS_THAN",
		"&kp SLASH",
	],

	[
		"&kp DOLLAR",
		"&kp HASH",
		"&kp PLUS",
		"&kp ASTERISK",
		"&kp PIPE",
		"&kp SINGLE_QUOTE",
		"&kp COMMA",
		"&kp DOT",
		"&kp QUESTION",
		"&kp UNDERSCORE",
	],

	[
		"&kp LEFT_ARROW",
		"&kp DOWN_ARROW",
		"&kp UP_ARROW",
		"&kp RIGHT_ARROW",
		"&none",
		"&kp GRAVE",
		"&kp EQUAL",
		"&trans",
		"&trans",
		"&kp TAB",
	],
	["&trans", "&trans", "&trans", "&trans", "&trans", "&trans"],
];

const layerB = [
	[
		"&kp N6",
		"&kp N7",
		"&kp N8",
		"&kp N9",
		"&kp N0",
		"&kp RIGHT_BRACE",
		"&kp RIGHT_BRACKET",
		"&kp RIGHT_PARENTHESIS",
		"&kp GREATER_THAN",
		"&kp BACKSLASH",
	],

	[
		"&kp AT",
		"&kp PERCENT",
		"&kp MINUS",
		"&kp SLASH",
		"&kp AMPERSAND",
		"&kp DOUBLE_QUOTES",
		"&kp SEMICOLON",
		"&kp COLON",
		"&kp EXCLAMATION",
		"&kp RA(UNDERSCORE)",
	],

	[
		"&none",
		"&none",
		"&none",
		"&none",
		"&none",
		"&kp RA(GRAVE)",
		"&kp CARET",
		"&trans",
		"&trans",
		"&none",
	],
	["&trans", "&trans", "&trans", "&trans", "&trans", "&trans"],
];

const modMorphs: string[] = [];

const combined: string[][] = [];

const cutAtMaxLen = (str: string, len: number) => {
	if (str.length <= len) return str;

	return str.slice(0, len);
};

const rightPad = (str: string, len: number) => {
	if (str.length >= len) return str;

	return str + " ".repeat(len - str.length);
};

const normalizeKeyname = (key: string) => {
	const ret = key
		.replaceAll("&kp ", "")
		.replaceAll("(", "")
		.replaceAll(")", "")
		.replaceAll("_", "")
		.replaceAll("&", "")
		.toLowerCase();

	if (ret.length > 5) {
		return cutAtMaxLen(ret, 4) + ret.slice(-1);
	}

	return ret;
};

const duplicateCheck = new Set<string>();

const createMofMorph = (keyA: string, keyB: string) => {
	const unifiedName = `${normalizeKeyname(keyA)}_${normalizeKeyname(keyB)}`;

	if (duplicateCheck.has(unifiedName)) {
		throw new Error(`Duplicate key: ${unifiedName}`);
	}
	duplicateCheck.add(unifiedName);

	const modMorph = `${unifiedName}: ${unifiedName} {
            compatible = "zmk,behavior-mod-morph";
            label = "${unifiedName.toUpperCase()}";
            bindings = <${keyA}>, <${keyB}>;

            #binding-cells = <0>;
            mods = <(MOD_RSFT)>;
};`;

	modMorphs.push(modMorph);

	return "&" + unifiedName;
};

layerA.forEach((row, rowIndex) => {
	const currentRow: string[] = [];
	combined.push(currentRow);

	if (rowIndex < 3) currentRow.push("&none");

	row.forEach((key, colIndex) => {
		const keyB = layerB[rowIndex][colIndex];

		if (key === keyB) {
			currentRow.push(key);
		} else {
			currentRow.push(createMofMorph(key, keyB));
		}
	});

	if (rowIndex < 3) currentRow.push("&none");
});

const text = combined
	.map((row, rowIndex) => {
		if (rowIndex === 3) row.unshift("", "", "");
		return row.map((key) => rightPad(key, 13)).join(" ");
	})
	.join("\n");

console.log(text);

console.log(modMorphs.join("\n"));
