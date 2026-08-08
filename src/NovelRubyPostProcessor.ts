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
			const ruby = match.groups?.ruby ?? ""; // if there is a match, there must be a ruby
			const body = match.groups?.body1 ? match.groups.body1 : match.groups?.body2 ?? "";
			// Set up ruby tag
			const rubyNode = activeDocument.createEl('ruby');
			if (hide) {
				rubyNode.addClass('ruby-hide');
			}
			rubyNode.addClass('ruby');
			rubyNode.createEl('rb' as keyof HTMLElementTagNameMap, { text: body });
			rubyNode.createEl('rt', { text: ruby });
			// Replace node
			if (lastNode.textContent) {
				const offset = lastNode.textContent.indexOf(match[0]);
				const nodeToReplace = lastNode.splitText(offset);
				lastNode = nodeToReplace.splitText(match[0].length);
				nodeToReplace.replaceWith(rubyNode);
			}
		}
	}
	return element;
}
/**
 * Ruby convert MarkdownPostProcessor - for reading view & live preview)
 */
export const novelRubyPostProcessor = (e: HTMLElement, ctx: MarkdownPostProcessorContext, app: App, settings: NovelRubyPluginSettings) => {
	if (!shouldEnableForNote(app, settings)) return;

	// function for process all nodes recursively
	function replaceRuby(node: Node) {
		const children: Text[] = [];
		// Collect text nodes except code block & ruby
		node.childNodes.forEach(child => {
			if (child.nodeType === Node.TEXT_NODE) {
				children.push(child as Text);
			} else if (child.hasChildNodes() && child.nodeName !== 'CODE' && child.nodeName !== 'RUBY') {
				replaceRuby(child);
			}
		});
		// Convert ruby marks to ruby tags
		children.forEach((child) => {
			child.replaceWith(convertNovelRuby(child, settings?.hideRuby));
		});
	}

	replaceRuby(e);
}
