import { App, PluginSettingTab, Setting } from "obsidian";

import NovelRubyPlugin from "./main";
import t from "./l10n";

export class NovelRubySettingTab extends PluginSettingTab {
	plugin: NovelRubyPlugin;

	constructor(app: App, plugin: NovelRubyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName(t("settings_source_mode_render_name"))
			.setDesc(t("settings_source_mode_render_desc"))
			.addToggle(text => text
				.setValue(this.plugin.settings.sourceModeRendering)
				.onChange(async (value) => {
					this.plugin.settings.sourceModeRendering = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl).setName(t("settings_command_title")).setHeading();

		new Setting(containerEl)
			.setName(t("settings_insert_full_width_separator_name"))
			.setDesc(t("settings_insert_full_width_separator_desc"))
			.addToggle(text => text
				.setValue(this.plugin.settings.insertFullWidthMark)
				.onChange(async (value) => {
					this.plugin.settings.insertFullWidthMark = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName(t("settings_emphashis_dot_name"))
			.setDesc(t("settings_emphashis_dot_desc"))
			.addText(text => text
				.setValue(this.plugin.settings.emphasisDot)
				.onChange(async (value) => {
					this.plugin.settings.emphasisDot = value[0];
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl).setName(t("settings_support_title")).setHeading();
		
		new Setting(containerEl)
			.setName(t("settings_donate_name"))
			.setDesc(t("settings_donate_desc"))
			.addButton(text => text
				.setButtonText(t("settings_donate_button"))
				.setCta()
				.onClick(() => {
					setTimeout(
						() => location.replace("https://buymeacoffee.com/quels"), 0
					);
				}));
	}
}