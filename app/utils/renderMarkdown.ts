// src/utils/renderMarkdown.ts
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";

const md = new MarkdownIt({ html: false });

export function renderMarkdown(markdown: string): string {
	const unsafe = md.render(markdown);
	return DOMPurify.sanitize(unsafe);
}
