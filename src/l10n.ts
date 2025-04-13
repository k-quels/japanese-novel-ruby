import { moment } from "obsidian";
import en from "../locale/en";
import ja from "../locale/ja";
import zh from "../locale/zh";

const localeMap = {
	en,
	ja,
	"zh-cn": zh,
	zh: zh,
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