import { normalizeKeyname, rightPad } from "./utils.ts";
import { parse } from "@std/yaml";

const keymapYaml = parse(Deno.readTextFileSync("./keymap.yaml")) as {
	baseLayer: string[][];
	codeLayer: string[][];
	codeLayerShift: string[][];
};

const addAndToLayer = (layer: string[][]) =>
	layer.map((row) => row.map((key) => `&${key}`));

const baseLayer = addAndToLayer(keymapYaml.baseLayer);
const codeLayer = addAndToLayer(keymapYaml.codeLayer);
const codeLayerShift = addAndToLayer(keymapYaml.codeLayerShift);

const modMorphs: string[] = [];

const combinedCodeLayer: string[][] = [];

const duplicateCheck = new Set<string>();

const createModMorph = (keyA: string, keyB: string) => {
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

const padMainRowsWithNone = (layer: string[][]) =>
	layer.map((row, rowIndex) => {
		if (rowIndex < 3) {
			return ["&none", ...row, "&none"];
		}
		return row;
	});

codeLayer.forEach((row, rowIndex) => {
	const currentRow: string[] = [];
	combinedCodeLayer.push(currentRow);

	row.forEach((key, colIndex) => {
		const keyB = codeLayerShift[rowIndex][colIndex];

		if (key === keyB) {
			currentRow.push(key);
		} else {
			currentRow.push(createModMorph(key, keyB));
		}
	});
});

const layerToText = (layer: string[][]) =>
	layer
		.map((row, rowIndex) => {
			if (rowIndex === 3) row.unshift("", "", "");
			return row.map((key) => rightPad(key, 13)).join(" ");
		})
		.join("\n");

const indent = "        ";

const modMorphsToText = (modMorphs: string[]) =>
	modMorphs.map((m) => indent + m.replaceAll("\n", "\n" + indent)).join("\n");

const baseLayerText = layerToText(padMainRowsWithNone(baseLayer));
const codeLayerText = layerToText(padMainRowsWithNone(combinedCodeLayer));
const behaviorsText = modMorphsToText(modMorphs);

const keymapTemplate = Deno.readTextFileSync("./corne.template.keymap");

const newKeymap = keymapTemplate
	.replace("{{base_layer}}", baseLayerText)
	.replace("{{code_layer}}", codeLayerText)
	.replace("{{behaviors}}", behaviorsText);

Deno.writeTextFileSync("../config/corne.keymap", newKeymap);
