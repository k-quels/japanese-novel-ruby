import { moment } from "obsidian";
import en from "../locale/en";
import ja from "../locale/ja";
import chs from "../locale/zh"; // Chinese (Simplified)
import cht from "../locale/zh-tw"; // Chinese (Traditional)

const localeMap = {
	en,
	ja,
	zh: chs,
	"zh-cn": chs,
	"zh-tw": cht,
}

const locale = localeMap[moment.locale() as keyof typeof localeMap];

export default function t(str: string): string {
	if (!locale) {
		console.error("Error: dictionary locale not found", moment.locale());
	}

	return (
		(locale && locale[str as keyof typeof locale]) ||
		en[str as keyof typeof en]
	);
}
