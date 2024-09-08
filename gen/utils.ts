const cutAtMaxLen = (str: string, len: number) => {
	if (str.length <= len) return str;

	return str.slice(0, len);
};
export const rightPad = (str: string, len: number) => {
	if (str.length >= len) return str;

	return str + " ".repeat(len - str.length);
};
export const normalizeKeyname = (key: string) => {
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
