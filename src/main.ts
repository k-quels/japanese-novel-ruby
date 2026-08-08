import { App, Editor, MarkdownView, Modal, Plugin, Setting, Notice, addIcon } from 'obsidian';
import { Prec } from '@codemirror/state';
import { novelRubyPostProcessor } from 'src/NovelRubyPostProcessor';
import { novelRubyExtension } from 'src/NovelRubyViewPlugin';
import { NovelRubySettingTab } from './NovelRubySettingTab';
import t from "./l10n";

// Regular expression for japanese novel ruby
// format type 1 (without prefix): (漢字)(《ふりがな》)
// format type 2 (with prefix)   : (| or ｜)(any characters except | or ｜)(《ふりがな》)
export class RubyRegex {
	static RUBY_REGEXP = RubyRegex.createRubyRegexp("《", "》");

	static createRubyRegexp(start: string, end: string) {
		return new RegExp(`(?:(?:[|｜]?(?<body1>[一-龠々仝〆〇ヶ]+?))|(?:[|｜](?<body2>[^|｜]+?)))${start}(?<ruby>.+?)${end}`, 'gm');
	}

	static changeRubyRegexp(start: string, end: string) {
		RubyRegex.RUBY_REGEXP = RubyRegex.createRubyRegexp(start, end);
	}

	static resetRubyRegexp() {
		RubyRegex.RUBY_REGEXP = RubyRegex.createRubyRegexp("《", "》");
	}
}

export interface NovelRubyPluginSettings {
	rubySize: number,
	hideRuby: boolean,
	sourceModeRendering: boolean,
	insertFullWidthMark: boolean,
	emphasisDot: string,
	enablePerNote: boolean,
	modifyRubyCharacter: boolean,
	startRubyCharacter: string,
	endRubyCharacter: string
}

const DEFAULT_SETTINGS: NovelRubyPluginSettings = {
	rubySize: 0.5,
	hideRuby: false,
	sourceModeRendering: true,
	insertFullWidthMark: true,
	emphasisDot: '・',
	enablePerNote: false, // Disable by default
	modifyRubyCharacter: false,
	startRubyCharacter: "《",
	endRubyCharacter: "》"
}

const ICON_DATA = {
    'novel-ruby-insert': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1.5" y="1.5" width="21" height="21" rx="2" /><path d="M8.5 20l3.5-7 3.5 7M9.5 18.5h4.5" /><circle cx="8.5" cy="8" r="1.9" /><path d="M10.5 6v4" /><circle cx="15.5" cy="8.5" r="1.7" /><path d="M13.5 4.5v5.5" /></svg>`,
    'novel-ruby-insert-direct': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21.5l5-9.5 5 9.8M8.5 19h7" /><circle cx="8.5" cy="6" r="2.0" /><path d="M10.5 8v-4" /><circle cx="15.5" cy="6.5" r="1.7" /><path d="M13.5 8v-6" /></svg>`,
    'novel-ruby-insert-dot': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21.5l5-9.5 5 9.8M8.5 19h7" /><circle cx="12" cy="6" r="0.8" fill="currentColor" /></svg>`,
    'novel-ruby-remove': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21.5l5-9.5 5 9.8M8.5 19h7" /><rect x="6" y="3" width="12" height="5.5" rx="1" stroke-dasharray="1 2.5" /></svg>`,
    'novel-ruby-toggle-ruby-hidden': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21.5l5-9.5 5 9.8M8.5 19h7" /><path d="M7 7h3" /><path d="M14 7h3" /></svg>`,
    'novel-ruby-toggle-source-mode-render': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m 7.5,21.0 4.5,-8.6 4.5,8.6 M 8.8,18.7 h 6.3" /><path d="M 7.2,7.1 H 10.0" /><path d="m 13.9,7.1 h 2.8" /><path d="M 5.1,13.0 1.0,17.2 5.1,21.3" /><path d="m 18.8,13.0 4.1,4.2 -4.1,4.1" /></svg>`
};

export default class NovelRubyPlugin extends Plugin {
	settings: NovelRubyPluginSettings;

	async onload() {
		await this.loadSettings();

		// Register custom icons
		for (const [id, svg] of Object.entries(ICON_DATA)) {
			addIcon(id, svg);
		}

		if (this.settings.modifyRubyCharacter) {
			RubyRegex.changeRubyRegexp(this.settings.startRubyCharacter, this.settings.endRubyCharacter);
		}

		this.registerMarkdownPostProcessor((el, ctx) => {
			novelRubyPostProcessor(el, ctx, this.app, this.settings); // affect to reading view
		});

		this.registerEditorExtension(Prec.lowest(novelRubyExtension(this.app, this))); // affect to editor (source or live-preview)

		// Detect frontmatter change & rerender preview (reading-mode)
		this.registerEvent(
			this.app.metadataCache.on("changed", (file, data, cache) => {
				const frontmatter = cache?.frontmatter;
				if (frontmatter) {
					if (file === this.app.workspace.getActiveFile()) {
						const view = this.app.workspace.getActiveViewOfType(MarkdownView);
						if (view) {
							view.previewMode.rerender(true);
						}
					}
				}
			})
		);

		// Display ruby insert modal
		this.addCommand({
			id: 'novel-ruby-insert',
			name: t("command_insert_novel_ruby"),
			icon: 'novel-ruby-insert',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const body = removeRuby(editor.getSelection());
				new RubyInsertModal(this.app, body, (insertBody, insertRuby) => {
					const separateMark = this.settings.insertFullWidthMark ? "｜" : "|";
					let start = "《";
					let end = "》";
					if (this.settings.modifyRubyCharacter) {
						start = this.settings.startRubyCharacter;
						end = this.settings.endRubyCharacter;
					}
					editor.replaceSelection(separateMark + insertBody + start + insertRuby + end);
				}).open();
			}
		});
		// Insert ruby directly
		this.addCommand({
			id: 'novel-ruby-insert-direct',
			name: t("command_insert_novel_ruby_direct"),
			icon: 'novel-ruby-insert-direct',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				const separateMark = this.settings.insertFullWidthMark ? "｜" : "|";
				let start = "《";
				let end = "》";
				if (this.settings.modifyRubyCharacter) {
					start = this.settings.startRubyCharacter;
					end = this.settings.endRubyCharacter;
				}

				const textToInsert = separateMark + selection + start + end;
				editor.replaceSelection(textToInsert);

				// Move cursor back inside the brackets
				const cursor = editor.getCursor();
				editor.setCursor({
					line: cursor.line,
					ch: cursor.ch - end.length
				});
			}
		});
		// Insert emphasis dot to selection
		this.addCommand({
			id: 'novel-ruby-insert-dot',
			name: t("command_insert_novel_dot"),
			icon: 'novel-ruby-insert-dot',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				let sel: string = editor.getSelection();
				if (sel == '') {
					new Notice(t("notice_insert_novel_dot_no_selection"), 2000);
				} else {
					// Insert emphasis dot per character
					let withDots = '';
					const separateMark = this.settings.insertFullWidthMark ? "｜" : "|";
					let start = "《";
					let end = "》";
					if (this.settings.modifyRubyCharacter) {
						start = this.settings.startRubyCharacter;
						end = this.settings.endRubyCharacter;
					}
					sel = removeRuby(sel);
					for (let c = 0; c < sel.length; c++) {
						withDots += separateMark + sel[c] + start + this.settings.emphasisDot[0] + end;
					}
					editor.replaceSelection(withDots);
				}
			}
		});
		// Clear ruby from selection
		this.addCommand({
			id: 'novel-ruby-remove',
			name: t("command_remove_novel_ruby"),
			icon: 'novel-ruby-remove',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				editor.replaceSelection(removeRuby(editor.getSelection()));
			}
		});

		// Toggle hide ruby unless hover
		this.addCommand({
			id: 'novel-ruby-toggle-ruby-hidden',
			name: t("command_toggle_ruby_hidden"),
			icon: 'novel-ruby-toggle-ruby-hidden',
			callback: async () => {
				this.settings.hideRuby = !this.settings.hideRuby;
				await this.saveSettings();
				new Notice(
					this.settings.hideRuby 
						? t("settings_hide_ruby_unless_hover_name") + ": " + t("state_on")
						: t("settings_hide_ruby_unless_hover_name") + ": " + t("state_off")
				);
			}
		});

		// Toggle source mode rendering
		this.addCommand({
			id: 'novel-ruby-toggle-source-mode-render',
			name: t("command_toggle_source_mode_render"),
			icon: 'novel-ruby-toggle-source-mode-render',
			callback: async () => {
				this.settings.sourceModeRendering = !this.settings.sourceModeRendering;
				await this.saveSettings();
				new Notice(
					this.settings.sourceModeRendering 
						? t("settings_source_mode_render_name") + ": " + t("state_on")
						: t("settings_source_mode_render_name") + ": " + t("state_off")
				);
			}
		});

		// Adds a settings tab
		this.addSettingTab(new NovelRubySettingTab(this.app, this));

	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as Partial<NovelRubyPluginSettings>);
		updateRubySize(this.app, this.settings.rubySize);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		updateRubySize(this.app, this.settings.rubySize);
		// Flush the changes to all editors
		this.app.workspace.updateOptions();
		// Rerender preview (reading-mode)
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (view) {
			view.previewMode.rerender(true);
		}
	}
}

/**
 * Remove ruby marks (《any characters》) from input
 * @param inputText string you want to remove ruby marks
 * @returns string without ruby marks
 */
function removeRuby(inputText: string): string {
	let outputText: string = inputText;
	const matches = Array.from(inputText.matchAll(RubyRegex.RUBY_REGEXP));
	for (const match of matches) {
		const body = match.groups?.body1 ? match.groups.body1 : match.groups?.body2 ?? "";
		outputText = outputText.replace(match[0], body);
	}
	return outputText;
}

/**
 * Display ruby insert modal
 */
export class RubyInsertModal extends Modal {
	body: string;
	ruby: string;
	onSubmit: (body: string, ruby: string) => void;

	constructor(app: App, defaultBody: string, onSubmit: (body: string, ruby: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
		this.body = defaultBody;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: t("ruby_insert_modal_title") });

		new Setting(contentEl)
			.setName(t("ruby_insert_modal_body"))
			.addText((text) => text
				.setValue(this.body)
				.onChange((value) => {
					this.body = value
				}));

		new Setting(contentEl)
			.setName(t("ruby_insert_modal_ruby"))
			.addText((text) =>
				text.onChange((value) => {
					this.ruby = value
				}));

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText(t("ruby_insert_modal_ok"))
					.setCta()
					.onClick(() => {
						this.close();
						this.onSubmit(this.body, this.ruby);
					}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

/**
 * Update ruby size style
 */
function updateRubySize(app: App, rubySize: number) {
	const size = `${rubySize}`;
	const documents = new Set<Document>([activeDocument]);

	app.workspace.iterateAllLeaves((leaf) => {
		documents.add(leaf.view.containerEl.ownerDocument);
	});

	for (const document of documents) {
		document.body.style.setProperty("--ruby-size", size);
		document.querySelectorAll<HTMLElement>("ruby > rt").forEach((rubyText) => {
			rubyText.style.setProperty("zoom", size);
		});
	}
}
