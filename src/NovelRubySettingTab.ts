import { App, PluginSettingTab, Setting } from "obsidian";

import NovelRubyPlugin, { RubyRegex } from "./main";
import t from "./l10n";

export class NovelRubySettingTab extends PluginSettingTab {
	plugin: NovelRubyPlugin;

	constructor(app: App, plugin: NovelRubyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): Record<string, unknown>[] {
		return [
			{
				type: "group",
				heading: t("settings_display_title"),
				items: [
					{
						name: t("settings_ruby_size_name"),
						desc: t("settings_ruby_size_desc"),
						control: {
							type: "number",
							key: "rubySize",
							defaultValue: 0.5,
							step: 0.01,
							validate: (value: number) => Number.isFinite(value) && value !== 0 ? undefined : t("settings_ruby_size_invalid"),
						},
					},
					{
						name: t("settings_source_mode_render_name"),
						desc: t("settings_source_mode_render_desc"),
						control: { type: "toggle", key: "sourceModeRendering" },
					},
					{
						name: t("settings_hide_ruby_unless_hover_name"),
						desc: t("settings_hide_ruby_unless_hover_desc"),
						control: { type: "toggle", key: "hideRuby" },
					},
					{
						name: t("settings_use_double_angle_for_emphasis_name"),
						desc: t("settings_use_double_angle_for_emphasis_desc"),
						control: { type: "toggle", key: "useDoubleAngleForEmphasis" },
					},
				],
			},
			{
				type: "group",
				heading: t("settings_command_title"),
				items: [
					{
						name: t("settings_insert_full_width_separator_name"),
						desc: t("settings_insert_full_width_separator_desc"),
						control: { type: "toggle", key: "insertFullWidthMark" },
					},
					{
						name: t("settings_emphashis_dot_name"),
						desc: t("settings_emphashis_dot_desc"),
						control: { type: "text", key: "emphasisDot" },
					},
				],
			},
			{
				type: "group",
				heading: t("settings_advanced_title"),
				items: [
					{
						name: t("settings_enable_pernote_name"),
						desc: t("settings_enable_pernote_desc"),
						control: { type: "toggle", key: "enablePerNote" },
					},
					{
						name: t("settings_modify_character_ruby_name"),
						desc: t("settings_modify_character_ruby_desc"),
						control: { type: "toggle", key: "modifyRubyCharacter" },
					},
					{
						name: t("settings_start_character_ruby_name"),
						desc: t("settings_start_character_ruby_desc"),
						visible: () => this.plugin.settings.modifyRubyCharacter,
						control: { type: "text", key: "startRubyCharacter" },
					},
					{
						name: t("settings_end_character_ruby_name"),
						desc: t("settings_end_character_ruby_desc"),
						visible: () => this.plugin.settings.modifyRubyCharacter,
						control: { type: "text", key: "endRubyCharacter" },
					},
				],
			},
			{
				type: "group",
				heading: t("settings_support_title"),
				items: [
					{
						name: t("settings_donate_name"),
						desc: t("settings_donate_desc"),
						render: (setting: Setting) => setting.addButton(button =>
							button
								.setButtonText(t("settings_donate_button"))
								.setCta()
								.onClick(() => window.setTimeout(
									() => location.replace("https://buymeacoffee.com/quels"),
									0,
								)),
						),
					},
				],
			},
		];
	}

	// Set the value of a control based on the key and value provided.
	async setControlValue(key: string, value: unknown): Promise<void> {
		switch (key) {
			case "rubySize":
				this.plugin.settings.rubySize = value as number;
				break;
			case "hideRuby":
				this.plugin.settings.hideRuby = value as boolean;
				break;
			case "sourceModeRendering":
				this.plugin.settings.sourceModeRendering = value as boolean;
				break;
			case "insertFullWidthMark":
				this.plugin.settings.insertFullWidthMark = value as boolean;
				break;
			case "useDoubleAngleForEmphasis":
				this.plugin.settings.useDoubleAngleForEmphasis = value as boolean;
				if (this.plugin.settings.modifyRubyCharacter) {
					RubyRegex.changeRubyRegexp(
						this.plugin.settings.startRubyCharacter,
						this.plugin.settings.endRubyCharacter,
						this.plugin.settings.useDoubleAngleForEmphasis,
					);
				} else {
					RubyRegex.changeRubyRegexp("《", "》", this.plugin.settings.useDoubleAngleForEmphasis);
				}
				break;
			case "emphasisDot":
				this.plugin.settings.emphasisDot = (value as string)[0];
				break;
			case "enablePerNote":
				this.plugin.settings.enablePerNote = value as boolean;
				break;
			case "modifyRubyCharacter":
				this.plugin.settings.modifyRubyCharacter = value as boolean;
				if (this.plugin.settings.modifyRubyCharacter) {
					RubyRegex.changeRubyRegexp(
						this.plugin.settings.startRubyCharacter,
						this.plugin.settings.endRubyCharacter,
						this.plugin.settings.useDoubleAngleForEmphasis,
					);
				} else {
					RubyRegex.resetRubyRegexp(this.plugin.settings.useDoubleAngleForEmphasis);
				}
				break;
			case "startRubyCharacter":
				this.plugin.settings.startRubyCharacter = value as string;
				RubyRegex.changeRubyRegexp(
					this.plugin.settings.startRubyCharacter,
					this.plugin.settings.endRubyCharacter,
					this.plugin.settings.useDoubleAngleForEmphasis,
				);
				break;
			case "endRubyCharacter":
				this.plugin.settings.endRubyCharacter = value as string;
				RubyRegex.changeRubyRegexp(
					this.plugin.settings.startRubyCharacter,
					this.plugin.settings.endRubyCharacter,
					this.plugin.settings.useDoubleAngleForEmphasis,
				);
				break;
			default:
				return;
		}
		await this.plugin.saveSettings();
		if (key === "modifyRubyCharacter") {
			(this as unknown as { refreshDomState(): void }).refreshDomState();
		}
	}

	// Keep this for Obsidian 1.12 and earlier.
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
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.sourceModeRendering)
				.onChange(async (value) => {
					this.plugin.settings.sourceModeRendering = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName(t("settings_hide_ruby_unless_hover_name"))
			.setDesc(t("settings_hide_ruby_unless_hover_desc"))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.hideRuby)
				.onChange(async (value) => {
					this.plugin.settings.hideRuby = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t("settings_use_double_angle_for_emphasis_name"))
			.setDesc(t("settings_use_double_angle_for_emphasis_desc"))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useDoubleAngleForEmphasis)
				.onChange(async (value) => {
					this.plugin.settings.useDoubleAngleForEmphasis = value;
					if (this.plugin.settings.modifyRubyCharacter) {
						RubyRegex.changeRubyRegexp(
							this.plugin.settings.startRubyCharacter,
							this.plugin.settings.endRubyCharacter,
							this.plugin.settings.useDoubleAngleForEmphasis,
						);
					} else {
						RubyRegex.changeRubyRegexp("《", "》", this.plugin.settings.useDoubleAngleForEmphasis);
					}
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
					if (value) {
						RubyRegex.changeRubyRegexp(
							this.plugin.settings.startRubyCharacter,
							this.plugin.settings.endRubyCharacter,
							this.plugin.settings.useDoubleAngleForEmphasis,
						);
					} else {
						RubyRegex.resetRubyRegexp(this.plugin.settings.useDoubleAngleForEmphasis);
					}

					await this.plugin.saveSettings();
					customRubyContainerEl.toggle(value);
				})
			);

		const customRubyContainerEl = containerEl.createDiv();
		customRubyContainerEl.toggle(this.plugin.settings.modifyRubyCharacter);

		new Setting(customRubyContainerEl)
			.setName(t("settings_start_character_ruby_name"))
			.setDesc(t("settings_start_character_ruby_desc"))
			.addText(text => text
				.setValue(this.plugin.settings.startRubyCharacter)
				.onChange(async (value) => {
					this.plugin.settings.startRubyCharacter = value;
					RubyRegex.changeRubyRegexp(
						this.plugin.settings.startRubyCharacter,
						this.plugin.settings.endRubyCharacter,
						this.plugin.settings.useDoubleAngleForEmphasis,
					);
					await this.plugin.saveSettings();
				})
			);

		new Setting(customRubyContainerEl)
			.setName(t("settings_end_character_ruby_name"))
			.setDesc(t("settings_end_character_ruby_desc"))
			.addText(text => text
				.setValue(this.plugin.settings.endRubyCharacter)
				.onChange(async (value) => {
					this.plugin.settings.endRubyCharacter = value;
					RubyRegex.changeRubyRegexp(
						this.plugin.settings.startRubyCharacter,
						this.plugin.settings.endRubyCharacter,
						this.plugin.settings.useDoubleAngleForEmphasis,
					);
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl).setName(t("settings_support_title")).setHeading();

		new Setting(containerEl)
			.setName(t("settings_donate_name"))
			.setDesc(t("settings_donate_desc"))
			.addButton(text => text
				.setButtonText(t("settings_donate_button"))
				.setCta()
				.onClick(() => {
					window.setTimeout(
						() => location.replace("https://buymeacoffee.com/quels"), 0
					);
				}));
	}
}
