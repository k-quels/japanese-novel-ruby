import { App, Editor, MarkdownView, Modal, Plugin, Setting, MarkdownPostProcessor, Notice } from 'obsidian';

import { novelRubyPostProcessor } from 'src/NovelRubyPostProcessor';
import { novelRubyExtension } from 'src/NovelRubyViewPlugin';
import { NovelRubySettingTab } from './NovelRubySettingTab';
import t from "./l10n";

// Regular expression for japanese novel ruby
// format type 1 (without prefix): (漢字)(《ふりがな》)
// format type 2 (with prefix)   : (| or ｜)(any characters except | or ｜)(《ふりがな》)
export const RUBY_REGEXP = /(?:(?:[|｜]?(?<body1>[一-龠]+?))|(?:[|｜](?<body2>[^|｜]+?)))《(?<ruby>.+?)》/gm;

interface NovelRubyPluginSettings {
	sourceModeRendering: boolean,
	insertFullWidthMark: boolean,
	emphasisDot: string
}

const DEFAULT_SETTINGS: NovelRubyPluginSettings = {
	sourceModeRendering: true,
	insertFullWidthMark: true,
	emphasisDot: '・'
}

export default class NovelRubyPlugin extends Plugin {
	settings: NovelRubyPluginSettings;
	public rubyPostProcessor: MarkdownPostProcessor = novelRubyPostProcessor;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownPostProcessor(this.rubyPostProcessor); // affect to reading view
		this.registerEditorExtension(novelRubyExtension(this.app, this)); // affect to editor (source or live-preview)

		// Display ruby insert modal
		this.addCommand({
			id: 'novel-ruby-insert',
			name: t("command_insert_novel_ruby"),
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const body = removeRuby(editor.getSelection());
				new RubyInsertModal(this.app, body, (insertBody, insertRuby) => {
					const separateMark = this.settings.insertFullWidthMark ? "｜" : "|";
					editor.replaceSelection(separateMark + insertBody + "《" + insertRuby + "》");
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
					sel = removeRuby(sel);
					for (let c = 0; c < sel.length; c++) {
						withDots += separateMark + sel[c] + '《' + this.settings.emphasisDot[0] + '》';
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
	}

	async saveSettings() {
		await this.saveData(this.settings);
		// Flush the changes to all editors
		this.app.workspace.updateOptions();
	}
}

/**
 * Remove ruby marks (《any characters》) from input
 * @param inputText string you want to remove ruby marks
 * @returns string without ruby marks
 */
function removeRuby(inputText: string): string {
	let outputText: string = inputText;
	const matches = Array.from(inputText.matchAll(RUBY_REGEXP));
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
	onSubmit: (body: string, ruby:string) => void;

	constructor(app: App, defaultBody: string, onSubmit: (body: string, ruby:string) => void) {
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
