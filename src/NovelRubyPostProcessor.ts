import { App, MarkdownPostProcessorContext } from "obsidian";

import { NovelRubyPluginSettings, RubyRegex } from "./main";

function shouldEnableForNote(app: App, settings: NovelRubyPluginSettings): boolean {
	if (!settings.enablePerNote) {
		return true; // enable ruby in all notes / 全局启用
	}
	const activeFile = app.workspace.getActiveFile();
	if (!activeFile) {
		return false; // does not work if there is no active file / 如果没有活动文件，则功能不生效
	}
	const frontmatter = app.metadataCache.getFileCache(activeFile)?.frontmatter;
	if (frontmatter && frontmatter["enable_ruby"] !== undefined) {
		return frontmatter["enable_ruby"] === true; // Judging by frontmatter / 根据 frontmatter 判断
	}
	return false;
}

/**
	Convert ruby marks to tag for MarkdownPostProcessor
*/
export const convertNovelRuby = (element: Text, hide = false): Node => {
	if (element.textContent) {
		const matches = Array.from(element.textContent.matchAll(RubyRegex.RUBY_REGEXP));
		let lastNode = element;
		for (const match of matches) {
			const ruby = match.groups?.ruby || match.groups?.ruby1 || match.groups?.ruby2 || ""; // if there is a match, there must be a ruby
			const body = match.groups?.body1 ? match.groups.body1 : match.groups?.body2 ?? "";
			// Set up ruby tag
			const rubyNode = createEl('ruby', {
				cls: hide ? 'ruby ruby-hide' : 'ruby',
				attr: { 'data-ruby-raw': match[0] }
			});
			rubyNode.createEl('rb' as keyof HTMLElementTagNameMap, { text: body });
			rubyNode.createEl('rt', { text: ruby });
			// Replace node
			if (lastNode.textContent) {
				const offset = lastNode.textContent.indexOf(match[0]);
				if (offset !== -1) {
					const nodeToReplace = lastNode.splitText(offset);
					lastNode = nodeToReplace.splitText(match[0].length);
					nodeToReplace.replaceWith(rubyNode);
				}
			}
		}
	}
	return element;
}

/**
	Convert emphasis marks (《《...》》) to tag for MarkdownPostProcessor
*/
export const convertNovelEmphasis = (element: Text, hide = false, dot = '・'): Node => {
	if (element.textContent) {
		const matches = Array.from(element.textContent.matchAll(RubyRegex.EMPHASIS_REGEXP));
		let lastNode = element;
		for (const match of matches) {
			const emphasisText = match.groups?.emphasis ?? "";
			const container = createSpan({
				cls: "novel-ruby-emphasis",
				attr: { 'data-emphasis-raw': match[0] }
			});
			for (const char of emphasisText) {
				const rubyNode = container.createEl('ruby', {
					cls: hide ? 'ruby ruby-hide' : 'ruby'
				});
				rubyNode.createEl('rb' as keyof HTMLElementTagNameMap, { text: char });
				rubyNode.createEl('rt', { text: dot });
			}

			if (lastNode.textContent) {
				const offset = lastNode.textContent.indexOf(match[0]);
				if (offset !== -1) {
					const nodeToReplace = lastNode.splitText(offset);
					lastNode = nodeToReplace.splitText(match[0].length);
					nodeToReplace.replaceWith(container);
				}
			}
		}
	}
	return element;
}

/**
 * Ruby convert MarkdownPostProcessor - for reading view & live preview)
 */
export const novelRubyPostProcessor = (e: HTMLElement, ctx: MarkdownPostProcessorContext | null, app: App, settings: NovelRubyPluginSettings) => {
	// Revert any previously rendered ruby and emphasis elements back to raw text before reprocessing
	e.querySelectorAll("ruby[data-ruby-raw]").forEach(rubyEl => {
		const raw = rubyEl.getAttribute("data-ruby-raw");
		if (raw) {
			rubyEl.replaceWith(document.createTextNode(raw));
		}
	});
	e.querySelectorAll(".novel-ruby-emphasis[data-emphasis-raw]").forEach(empEl => {
		const raw = empEl.getAttribute("data-emphasis-raw");
		if (raw) {
			empEl.replaceWith(document.createTextNode(raw));
		}
	});

	const isEnabled = shouldEnableForNote(app, settings);
	if (!isEnabled) {
		return;
	}

	// function for process all text nodes recursively
	function processTextNodes(node: Node, processor: (textNode: Text) => void) {
		const children: Text[] = [];
		function collect(n: Node) {
			n.childNodes.forEach(child => {
				if (child.nodeType === Node.TEXT_NODE) {
					children.push(child as Text);
				} else if (child.hasChildNodes() && child.nodeName !== 'CODE' && child.nodeName !== 'RUBY') {
					collect(child);
				}
			});
		}
		collect(node);
		children.forEach(processor);
	}

	// 1. Convert ruby marks
	processTextNodes(e, (child) => {
		convertNovelRuby(child, settings?.hideRuby);
	});

	// 2. Convert emphasis marks (if enabled)
	if (settings?.useDoubleAngleForEmphasis) {
		processTextNodes(e, (child) => {
			convertNovelEmphasis(child, settings?.hideRuby, settings?.emphasisDot);
		});
	}
}
