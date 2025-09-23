import { App, Editor, MarkdownView, Modal, Plugin, Setting, Notice } from 'obsidian';
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
		return new RegExp(`(?:(?:[|｜]?(?<body1>[一-龠々]+?))|(?:[|｜](?<body2>[^|｜]+?)))${start}(?<ruby>.+?)${end}`, 'gm');
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

export default class NovelRubyPlugin extends Plugin {
	settings: NovelRubyPluginSettings;

	async onload() {
		await this.loadSettings();
		if (this.settings.modifyRubyCharacter) {
			RubyRegex.changeRubyRegexp(this.settings.startRubyCharacter, this.settings.endRubyCharacter);
		}

		this.registerMarkdownPostProcessor((el, ctx) => {
			novelRubyPostProcessor(el, ctx, this.settings); // affect to reading view
		});

		this.registerEditorExtension(novelRubyExtension(this.app, this)); // affect to editor (source or live-preview)

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
		// Insert emphasis dot to selection
		this.addCommand({
			id: 'novel-ruby-insert-dot',
			name: t("command_insert_novel_dot"),
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
			editorCallback: (editor: Editor, view: MarkdownView) => {
				editor.replaceSelection(removeRuby(editor.getSelection()));
			}
		});

		// Adds a settings tab
		this.addSettingTab(new NovelRubySettingTab(this.app, this));

	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		updateRubySize(this.settings.rubySize);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		updateRubySize(this.settings.rubySize);
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
		const body = match.groups?.body1 ? match.groups!.body1 : match.groups!.body2;
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
function updateRubySize(rubySize: number) {
	activeDocument.body.style.setProperty("--ruby-size", `${rubySize}`);
}
