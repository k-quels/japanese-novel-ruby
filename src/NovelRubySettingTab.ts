import { App, PluginSettingTab, Setting } from "obsidian";

import NovelRubyPlugin, { RubyRegex } from "./main";
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

		new Setting(containerEl).setName(t("settings_display_title")).setHeading();

		new Setting(containerEl)
			.setName(t("settings_ruby_size_name"))
			.setDesc(t("settings_ruby_size_desc"))
			.addText(text => text
				.setValue(String(this.plugin.settings.rubySize))
				.setPlaceholder("0.5")
				.onChange(async (value) => {
					const saveValue: number = Number(value) ? Number(value) : 0.5;
					this.plugin.settings.rubySize = saveValue;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
		.setName(t("settings_source_mode_render_name"))
		.setDesc(t("settings_source_mode_render_desc"))
		.addToggle(text => text
			.setValue(this.plugin.settings.sourceModeRendering)
			.onChange(async (value) => {
				this.plugin.settings.sourceModeRendering = value;
				await this.plugin.saveSettings();
			}));
		
		new Setting(containerEl)
			.setName(t("settings_hide_ruby_unless_hover_name"))
			.setDesc(t("settings_hide_ruby_unless_hover_desc"))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.hideRuby)
				.onChange(async (value) => {
					this.plugin.settings.hideRuby = value;
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

		new Setting(containerEl).setName(t("settings_advanced_title")).setHeading();

		new Setting(containerEl)
			.setName(t("settings_enable_pernote_name"))
			.setDesc(t("settings_enable_pernote_desc"))
			.addToggle(text => text
				.setValue(this.plugin.settings.enablePerNote)
				.onChange(async (value) => {
					this.plugin.settings.enablePerNote = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t("settings_modify_character_ruby_name"))
			.setDesc(t("settings_modify_character_ruby_desc"))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.modifyRubyCharacter)
				.onChange(async (value) => {
					this.plugin.settings.modifyRubyCharacter = value;

					// Switch the ruby regexp when toggled.
					if (!value) {
						RubyRegex.resetRubyRegexp();
					} else {
						RubyRegex.changeRubyRegexp(this.plugin.settings.startRubyCharacter, this.plugin.settings.endRubyCharacter);
					}

					await this.plugin.saveSettings();
					this.display();
				})
			);

		if (this.plugin.settings.modifyRubyCharacter) {
			new Setting(containerEl)
				.setName(t("settings_start_character_ruby_name"))
				.setDesc(t("settings_start_character_ruby_desc"))
				.addText(text => text
					.setValue(this.plugin.settings.startRubyCharacter)
					.onChange(async (value) => {
						this.plugin.settings.startRubyCharacter = value;
						RubyRegex.changeRubyRegexp(this.plugin.settings.startRubyCharacter, this.plugin.settings.endRubyCharacter);
						await this.plugin.saveSettings();
					})
				);

			new Setting(containerEl)
				.setName(t("settings_end_character_ruby_name"))
				.setDesc(t("settings_end_character_ruby_desc"))
				.addText(text => text
					.setValue(this.plugin.settings.endRubyCharacter)
					.onChange(async (value) => {
						this.plugin.settings.endRubyCharacter = value;
						RubyRegex.changeRubyRegexp(this.plugin.settings.startRubyCharacter, this.plugin.settings.endRubyCharacter);
						await this.plugin.saveSettings();
					})
				);
		}
		
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
