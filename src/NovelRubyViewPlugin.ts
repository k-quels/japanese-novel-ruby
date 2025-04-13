import { App } from "obsidian";
import { ViewPlugin, WidgetType, ViewUpdate, Decoration, DecorationSet, EditorView } from '@codemirror/view';
import { RangeSetBuilder } from "@codemirror/state";
import { editorLivePreviewField } from 'obsidian';

import NovelRubyPlugin, { RubyRegex } from "./main";

function shouldEnableForNote(plugin: NovelRubyPlugin, view : EditorView): boolean {
	const viewVerified = plugin.settings.sourceModeRendering || view.state.field(editorLivePreviewField);

	if (!plugin.settings.enablePerNote) {
		return viewVerified;
	}

	const activeFile = this.app.workspace.getActiveFile();
	if (!activeFile) {
		return false; // does not work if there is no active file / 如果没有活动文件，则功能不生效
	}
	const frontmatter = this.app.metadataCache.getFileCache(activeFile)?.frontmatter;
	if (frontmatter && frontmatter["enable_ruby"] !== undefined) {
		return frontmatter["enable_ruby"] === true && viewVerified;
	}
	return false;
}

/**
	Tag insert widget for View Plugin
 */
class NovelRubyWidget extends WidgetType {
	constructor(readonly body: string, readonly ruby: string, readonly hide: boolean = false) {
		super();
	}

	toDOM(view: EditorView): HTMLElement {
		const ruby = document.createElement('ruby');
		if (this.hide) {
			ruby.className = "ruby-hide";
		}
		ruby.appendText(this.body);
		ruby.createEl('rt', {text: this.ruby});
		return ruby;
	}
}

/**
	View Plugin wrapper function for access to plugin settings - for editor view
 */
export function novelRubyExtension(app: App, plugin: NovelRubyPlugin) {
	return ViewPlugin.fromClass(class {
		decorations: DecorationSet;
		sourceModeRendering: boolean; // needs to detect setting change
		perNoteEnable: boolean; // needs to detect per note setting change
		modifyRubyCharacter: boolean;
		startRubyCharacter: string;
		endRubyCharacter: string;

		constructor(view: EditorView) {
			this.decorations = this.updateDecorations(view);
			this.sourceModeRendering = plugin.settings.sourceModeRendering;
			this.perNoteEnable = plugin.settings.enablePerNote;
			this.modifyRubyCharacter = plugin.settings.modifyRubyCharacter;
			this.startRubyCharacter = plugin.settings.startRubyCharacter;
			this.endRubyCharacter = plugin.settings.endRubyCharacter;
		}

		update(update: ViewUpdate) {
			if (update.docChanged || update.viewportChanged || update.selectionSet ||
				(update.startState.field(editorLivePreviewField) != update.state.field(editorLivePreviewField)) ||
				(!update.startState.field(editorLivePreviewField) && (this.sourceModeRendering != plugin.settings.sourceModeRendering)) ||
				(this.modifyRubyCharacter != plugin.settings.modifyRubyCharacter) ||
				(this.startRubyCharacter != plugin.settings.startRubyCharacter) ||
				(this.endRubyCharacter != plugin.settings.endRubyCharacter)) {
				// apply settings to view plugin (necessary to apply changes as soon as settings are changed)
				if (this.sourceModeRendering != plugin.settings.sourceModeRendering) {
					this.sourceModeRendering = plugin.settings.sourceModeRendering;
				}
				if (this.modifyRubyCharacter != plugin.settings.modifyRubyCharacter) {
					this.modifyRubyCharacter = plugin.settings.modifyRubyCharacter;
				}
				if (this.startRubyCharacter != plugin.settings.startRubyCharacter) {
					this.startRubyCharacter = plugin.settings.startRubyCharacter;
				}
				if (this.endRubyCharacter != plugin.settings.endRubyCharacter) {
					this.endRubyCharacter = plugin.settings.endRubyCharacter;
				}
				this.decorations = this.updateDecorations(update.view);
			}
		}

		destroy() {	}

		/**
		 * Set up DecorationSet with setting & mode check
		 */
		private updateDecorations(view: EditorView): DecorationSet {
			if (shouldEnableForNote(plugin, view)) {
				return this.buildDecorations(view);
			} else {
				return Decoration.none;
			}
		}

		/**
		 * Convert ruby marks to tag
		 */
		buildDecorations(view: EditorView): DecorationSet {
			const builder = new RangeSetBuilder<Decoration>();
			const selections = [...view.state.selection.ranges];

			for (const viewRange of view.visibleRanges) {
				// if whole viewport is selected, skip decorate
				selections.forEach((r) => {
					if (r.to >= viewRange.from && r.from <= viewRange.to) {
						return;
					}
				});
				// search ruby & decorate
				for (let pos = viewRange.from; pos <= viewRange.to;) {
					const line = view.state.doc.lineAt(pos);
					const matches = Array.from(line.text.matchAll(RubyRegex.RUBY_REGEXP));
					for (const match of matches) {
						let add = true;
						const ruby = match.groups!.ruby; // if there is a match, there will be ruby
						const body = match.groups?.body1 ? match.groups!.body1 : match.groups!.body2;
						const from = match.index != undefined ? match.index + line.from : -1
						const to = from + match[0].length;
						// exclude selection
						selections.forEach((r) => {
							if (r.to >= from && r.from <= to) {
								add = false;
							}
						})
						if (add) {
							builder.add(from, to, Decoration.widget({widget: new NovelRubyWidget(body, ruby, plugin.settings.hideRuby)}))
						}
					}
					pos = line.to + 1;
				}
			}
			return builder.finish();
		}
	}, {
		decorations: (v) => v.decorations,
	})
}