import { App } from "obsidian";
import { ViewPlugin, ViewUpdate, Decoration, DecorationSet, EditorView } from '@codemirror/view';
import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";
import { editorLivePreviewField } from 'obsidian';

import NovelRubyPlugin, { RubyRegex } from "./main";

function shouldEnableForNote(plugin: NovelRubyPlugin, view: EditorView, app: App): boolean {
	const viewVerified = plugin.settings.sourceModeRendering || view.state.field(editorLivePreviewField);

	if (!plugin.settings.enablePerNote) {
		return viewVerified;
	}

	const activeFile = app.workspace.getActiveFile();
	if (!activeFile) {
		return false; // does not work if there is no active file / 如果没有活动文件，则功能不生效
	}
	const frontmatter = app.metadataCache.getFileCache(activeFile)?.frontmatter;
	if (frontmatter && frontmatter["enable_ruby"] !== undefined) {
		return frontmatter["enable_ruby"] === true && viewVerified;
	}
	return false;
}

/**
	View Plugin wrapper function for access to plugin settings - for editor view
 */
export function novelRubyExtension(app: App, plugin: NovelRubyPlugin) {
	return ViewPlugin.fromClass(class {
		decorations: DecorationSet;
		sourceModeRendering: boolean; // needs to detect setting change
		hideRuby: boolean;
		perNoteEnable: boolean; // needs to detect per note setting change
		modifyRubyCharacter: boolean;
		startRubyCharacter: string;
		endRubyCharacter: string;

		constructor(view: EditorView) {
			this.decorations = this.updateDecorations(view);
			this.sourceModeRendering = plugin.settings.sourceModeRendering;
			this.hideRuby = plugin.settings.hideRuby;
			this.perNoteEnable = plugin.settings.enablePerNote;
			this.modifyRubyCharacter = plugin.settings.modifyRubyCharacter;
			this.startRubyCharacter = plugin.settings.startRubyCharacter;
			this.endRubyCharacter = plugin.settings.endRubyCharacter;
		}

		update(update: ViewUpdate) {
			if (update.docChanged || update.viewportChanged || update.selectionSet ||
				(update.startState.field(editorLivePreviewField) != update.state.field(editorLivePreviewField)) ||
				(!update.startState.field(editorLivePreviewField) && (this.sourceModeRendering != plugin.settings.sourceModeRendering)) ||
				(this.hideRuby != plugin.settings.hideRuby) ||
				(this.modifyRubyCharacter != plugin.settings.modifyRubyCharacter) ||
				(this.startRubyCharacter != plugin.settings.startRubyCharacter) ||
				(this.endRubyCharacter != plugin.settings.endRubyCharacter)) {
				// apply settings to view plugin (necessary to apply changes as soon as settings are changed)
				if (this.sourceModeRendering != plugin.settings.sourceModeRendering) {
					this.sourceModeRendering = plugin.settings.sourceModeRendering;
				}
				if (this.hideRuby != plugin.settings.hideRuby) {
					this.hideRuby = plugin.settings.hideRuby;
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

		destroy() { }

		/**
		 * Set up DecorationSet with setting & mode check
		 */
		private updateDecorations(view: EditorView): DecorationSet {
			// Pass app explicitly to fix scoping issue
			if (shouldEnableForNote(plugin, view, app)) {
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
			const selections = view.state.selection.ranges;
			let lastLine = -1;

			for (const visibleRange of view.visibleRanges) {
				for (let pos = visibleRange.from; pos <= visibleRange.to;) {
					const line = view.state.doc.lineAt(pos);
					if (line.number === lastLine) {
						// this line has already been processed, skip to the next position
						pos = line.to + 1;
						continue;
					}
					lastLine = line.number;

					const text = line.text;
					const matches = Array.from(text.matchAll(RubyRegex.RUBY_REGEXP));

					for (const match of matches) {
						if (match.index === undefined) continue;

						const matchStart = line.from + match.index;
						const matchEnd = matchStart + match[0].length;

						// exclude selection
						let inSelection = false;
						for (const r of selections) {
							if (r.to >= matchStart && r.from <= matchEnd) {
								inSelection = true;
								break;
							}
						}
						if (inSelection) continue;

						// exclude code blocks and images
						// Resolve node at (matchStart + 1) to ensure we get the inner node (e.g. InlineCode)
						// even if the match starts exactly at the node boundary.
						const node = syntaxTree(view.state).resolve(matchStart + 1);
						const nodeName = node.name;
						
						if (nodeName.includes("Code") || nodeName.includes("code") || nodeName.includes("Image") || nodeName.includes("image")) {
							continue;
						}
						
						// Also check parent just in case we are inside a text node inside the code block
						if (node.parent?.name.includes("Code") || node.parent?.name.includes("code") || node.parent?.name.includes("Image") || node.parent?.name.includes("image")) {
							continue;
						}

						const body = match.groups?.body1 || match.groups?.body2;
						const rubyText = match.groups?.ruby;

						if (!body || !rubyText) continue;

						const fullMatchText = match[0];
						const bodyIndex = fullMatchText.indexOf(body);
						const startDelim = plugin.settings.modifyRubyCharacter ? plugin.settings.startRubyCharacter : "《";

						const prefixLength = bodyIndex;

						// Check if the prefix is a half-width pipe followed by a space (Table cell)
						let isTablePipe = false;
						if (prefixLength === 1 && fullMatchText[0] === '|' && body.startsWith(' ')) {
							isTablePipe = true;
						}

						// 1. Prefix (separator like |)
						// If it's a table pipe, we do NOT hide it (to preserve table structure)
						if (prefixLength > 0 && !isTablePipe) {
							builder.add(matchStart, matchStart + prefixLength, Decoration.replace({}));
						}

						// 2. Wrap everything in <ruby>
						const rubyClass = "novel-ruby" + (this.hideRuby ? " ruby-hide" : "");
						let rubyContentStart = matchStart + prefixLength;
						
						// If it's a table pipe, we check if the body ends with Kanji (or similar)
						if (isTablePipe) {
							rubyContentStart += 1; // At least skip the leading space
							
							// If body ends with Kanji, we treat only the Kanji part as ruby
							const kanjiMatch = body.match(/[一-龠々仝〆〇ヶ]+$/);
							if (kanjiMatch) {
								const kanjiLength = kanjiMatch[0].length;
								// If there is non-kanji text before the kanji tail (excluding the leading space)
								if (body.length - 1 > kanjiLength) {
									rubyContentStart = matchStart + prefixLength + (body.length - kanjiLength);
								}
							}
						}

						builder.add(rubyContentStart, matchEnd, Decoration.mark({ tagName: "ruby", class: rubyClass }));

						// 3. Start Delimiter (e.g. 《) - Hide it by replacing with empty widget
						const bodyEndRel = bodyIndex + body.length;
						const startDelimStart = matchStart + bodyEndRel;
						const startDelimEnd = startDelimStart + startDelim.length;

						// Check if delim exists in text (it should)
						if (startDelimStart < startDelimEnd) {
							builder.add(startDelimStart, startDelimEnd, Decoration.replace({}));
						}

						// 4. Ruby Text -> <rt>
						const rubyStart = startDelimEnd;
						const rubyEnd = rubyStart + rubyText.length;
						if (rubyEnd > rubyStart) {
							builder.add(rubyStart, rubyEnd, Decoration.mark({ tagName: "rt" }));
						}

						// 5. End Delimiter (e.g. 》) - Hide it by replacing with empty widget
						const endDelimStart = rubyEnd;
						const endDelimEnd = matchStart + match[0].length;
						if (endDelimEnd > endDelimStart) {
							builder.add(endDelimStart, endDelimEnd, Decoration.replace({}));
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
