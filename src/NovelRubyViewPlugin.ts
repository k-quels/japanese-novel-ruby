import { App } from "obsidian";
import { ViewPlugin, WidgetType, ViewUpdate, Decoration, DecorationSet, EditorView } from '@codemirror/view';
import { RangeSetBuilder } from "@codemirror/state";
import { editorLivePreviewField } from 'obsidian';

import NovelRubyPlugin from "./main";
import { RUBY_REGEXP } from "./main";

/**
	Tag insert widget for View Plugin
*/
class NovelRubyWidget extends WidgetType {
	constructor(readonly body: string, readonly ruby: string) {
		super();
	}

	toDOM(view: EditorView): HTMLElement {
		const ruby = document.createElement('ruby');
		ruby.appendText(this.body);
		ruby.createEl('rt', { text: this.ruby });
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
	
		constructor(view: EditorView) {
			this.decorations = this.updateDecorations(view);
			this.sourceModeRendering = plugin.settings.sourceModeRendering;
		}

		update(update: ViewUpdate) {
			if (update.docChanged || update.viewportChanged || update.selectionSet ||
				(update.startState.field(editorLivePreviewField) != update.state.field(editorLivePreviewField)) ||
				(!update.startState.field(editorLivePreviewField) && (this.sourceModeRendering != plugin.settings.sourceModeRendering))) {
				if (this.sourceModeRendering != plugin.settings.sourceModeRendering){
					this.sourceModeRendering = plugin.settings.sourceModeRendering; // apply setting to view plugin
				}
				this.decorations = this.updateDecorations(update.view);
			}
		}

		destroy() { }

		/**
		 * Set up DecorationSet with setting & mode check
		 */
		private updateDecorations(view: EditorView): DecorationSet {
			if (plugin.settings.sourceModeRendering || view.state.field(editorLivePreviewField)) {
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
					const matches = Array.from(line.text.matchAll(RUBY_REGEXP));
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
							builder.add(from, to, Decoration.widget({ widget: new NovelRubyWidget(body, ruby) }))
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