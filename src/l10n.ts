import { moment } from "obsidian";
import en from "../locale/en";
import ja from "../locale/ja";

const localeMap = {
	en,
	ja,
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