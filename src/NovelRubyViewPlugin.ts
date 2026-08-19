import { App } from "obsidian";
import { ViewPlugin, ViewUpdate, Decoration, DecorationSet, EditorView, WidgetType } from '@codemirror/view';
import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";
import { editorLivePreviewField } from 'obsidian';

import NovelRubyPlugin, { RubyRegex } from "./main";

class RubyWidget extends WidgetType {
	constructor(
		readonly body: string,
		readonly ruby: string,
		readonly hide: boolean
	) {
		super();
	}

	eq(other: RubyWidget) {
		return other.body === this.body && other.ruby === this.ruby && other.hide === this.hide;
	}

	toDOM(view: EditorView): HTMLElement {
		const rubyEl = createEl("ruby", {
			cls: this.hide ? "novel-ruby ruby-hide" : "novel-ruby",
		});
		rubyEl.createEl("rb" as keyof HTMLElementTagNameMap, { text: this.body });
		rubyEl.createEl("rt", { text: this.ruby });
		return rubyEl;
	}

	ignoreEvent() {
		return false;
	}
}

class EmphasisWidget extends WidgetType {
	constructor(
		readonly text: string,
		readonly dot: string,
		readonly hide: boolean
	) {
		super();
	}

	eq(other: EmphasisWidget) {
		return other.text === this.text && other.dot === this.dot && other.hide === this.hide;
	}

	toDOM(view: EditorView): HTMLElement {
		const span = createSpan({
			cls: "novel-ruby-emphasis",
		});
		for (const char of this.text) {
			const rubyEl = span.createEl("ruby", {
				cls: this.hide ? "novel-ruby ruby-hide" : "novel-ruby",
			});
			rubyEl.createEl("rb" as keyof HTMLElementTagNameMap, { text: char });
			rubyEl.createEl("rt", { text: this.dot });
		}
		return span;
	}

	ignoreEvent() {
		return false;
	}
}

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
		rubySize: number;
		sourceModeRendering: boolean; // needs to detect setting change
		hideRuby: boolean;
		perNoteEnable: boolean; // needs to detect per note setting change
		currentNoteEnabled: boolean;
		useDoubleAngleForEmphasis: boolean;
		emphasisDot: string;
		modifyRubyCharacter: boolean;
		startRubyCharacter: string;
		endRubyCharacter: string;

		constructor(view: EditorView) {
			this.decorations = this.updateDecorations(view);
			this.rubySize = plugin.settings.rubySize;
			this.sourceModeRendering = plugin.settings.sourceModeRendering;
			this.hideRuby = plugin.settings.hideRuby;
			this.perNoteEnable = plugin.settings.enablePerNote;
			this.currentNoteEnabled = shouldEnableForNote(plugin, view, app);
			this.useDoubleAngleForEmphasis = plugin.settings.useDoubleAngleForEmphasis;
			this.emphasisDot = plugin.settings.emphasisDot;
			this.modifyRubyCharacter = plugin.settings.modifyRubyCharacter;
			this.startRubyCharacter = plugin.settings.startRubyCharacter;
			this.endRubyCharacter = plugin.settings.endRubyCharacter;
		}

		update(update: ViewUpdate) {
			const isNoteEnabled = shouldEnableForNote(plugin, update.view, app);
			if (update.docChanged || update.viewportChanged || update.selectionSet ||
				(this.currentNoteEnabled !== isNoteEnabled) ||
				(update.startState.field(editorLivePreviewField) != update.state.field(editorLivePreviewField)) ||
				(this.rubySize != plugin.settings.rubySize) ||
				(this.perNoteEnable != plugin.settings.enablePerNote) ||
				(!update.startState.field(editorLivePreviewField) && (this.sourceModeRendering != plugin.settings.sourceModeRendering)) ||
				(this.hideRuby != plugin.settings.hideRuby) ||
				(this.useDoubleAngleForEmphasis != plugin.settings.useDoubleAngleForEmphasis) ||
				(this.emphasisDot != plugin.settings.emphasisDot) ||
				(this.modifyRubyCharacter != plugin.settings.modifyRubyCharacter) ||
				(this.startRubyCharacter != plugin.settings.startRubyCharacter) ||
				(this.endRubyCharacter != plugin.settings.endRubyCharacter)) {
				// apply settings to view plugin (necessary to apply changes as soon as settings are changed)
				if (this.currentNoteEnabled !== isNoteEnabled) {
					this.currentNoteEnabled = isNoteEnabled;
				}
				if (this.rubySize != plugin.settings.rubySize) {
					this.rubySize = plugin.settings.rubySize;
				}
				if (this.perNoteEnable != plugin.settings.enablePerNote) {
					this.perNoteEnable = plugin.settings.enablePerNote;
				}
				if (this.sourceModeRendering != plugin.settings.sourceModeRendering) {
					this.sourceModeRendering = plugin.settings.sourceModeRendering;
				}
				if (this.hideRuby != plugin.settings.hideRuby) {
					this.hideRuby = plugin.settings.hideRuby;
				}
				if (this.useDoubleAngleForEmphasis != plugin.settings.useDoubleAngleForEmphasis) {
					this.useDoubleAngleForEmphasis = plugin.settings.useDoubleAngleForEmphasis;
				}
				if (this.emphasisDot != plugin.settings.emphasisDot) {
					this.emphasisDot = plugin.settings.emphasisDot;
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
				let loopCount = 0;
				for (let pos = visibleRange.from; pos <= visibleRange.to;) {
					// Safety guard to prevent UI freeze from infinite loops if pos fails to advance
					loopCount++;
					if (loopCount > 1000) {
						break;
					}

					const line = view.state.doc.lineAt(pos);
					if (line.number === lastLine) {
						// this line has already been processed, skip to the next position
						pos = line.to + 1;
						continue;
					}
					lastLine = line.number;

					const text = line.text;
					const matches = Array.from(text.matchAll(RubyRegex.RUBY_REGEXP));

					interface DecoratorItem {
						from: number;
						to: number;
						widget: WidgetType;
					}
					const items: DecoratorItem[] = [];
					const occupiedRanges: { from: number; to: number }[] = [];

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
						const rubyText = match.groups?.ruby || match.groups?.ruby1 || match.groups?.ruby2;

						if (!body || !rubyText) continue;

						const fullMatchText = match[0];
						const prefixLength = (fullMatchText.startsWith('|') || fullMatchText.startsWith('｜')) ? 1 : 0;

						// Check if the prefix is a half-width pipe followed by a space (Table cell)
						const isTablePipe = prefixLength === 1 && fullMatchText[0] === '|' && body.startsWith(' ');

						let finalBody = body;
						let widgetStart = matchStart;

						// If it's a table pipe, we check if the body ends with Kanji (or similar)
						if (isTablePipe) {
							if (this.useDoubleAngleForEmphasis && (rubyText.startsWith('《') || fullMatchText.includes('《《'))) {
								continue;
							}
							widgetStart = matchStart + prefixLength + 1; // At least skip the leading pipe and space
							
							// If body ends with Kanji, we treat only the Kanji part as ruby
							const kanjiMatch = body.match(/[一-龠々仝〆〇ヶ]+$/);
							if (kanjiMatch) {
								const kanjiLength = kanjiMatch[0].length;
								// If there is non-kanji text before the kanji tail (excluding the leading space)
								if (body.length - 1 > kanjiLength) {
									widgetStart = matchStart + prefixLength + (body.length - kanjiLength);
								}
								finalBody = kanjiMatch[0];
							}
						}

						if (widgetStart < matchEnd) {
							items.push({
								from: widgetStart,
								to: matchEnd,
								widget: new RubyWidget(finalBody, rubyText, this.hideRuby)
							});
							occupiedRanges.push({ from: matchStart, to: matchEnd });
						}
					}

					// Emphasis matches (if enabled)
					if (this.useDoubleAngleForEmphasis) {
						const emphasisMatches = Array.from(text.matchAll(RubyRegex.EMPHASIS_REGEXP));
						for (const match of emphasisMatches) {
							if (match.index === undefined) continue;

							const matchStart = line.from + match.index;
							const matchEnd = matchStart + match[0].length;

							// Check if overlapping with already processed ruby
							const isOverlapping = occupiedRanges.some(range =>
								(matchStart < range.to && matchEnd > range.from)
							);
							if (isOverlapping) continue;

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
							const node = syntaxTree(view.state).resolve(matchStart + 1);
							const nodeName = node.name;
							
							if (nodeName.includes("Code") || nodeName.includes("code") || nodeName.includes("Image") || nodeName.includes("image")) {
								continue;
							}
							
							if (node.parent?.name.includes("Code") || node.parent?.name.includes("code") || node.parent?.name.includes("Image") || node.parent?.name.includes("image")) {
								continue;
							}

							const emphasisText = match.groups?.emphasis;
							if (!emphasisText) continue;

							items.push({
								from: matchStart,
								to: matchEnd,
								widget: new EmphasisWidget(emphasisText, this.emphasisDot, this.hideRuby)
							});
						}
					}

					// Sort items by position 'from'
					items.sort((a, b) => a.from - b.from);

					for (const item of items) {
						builder.add(item.from, item.to, Decoration.replace({
							widget: item.widget
						}));
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
