import parser from 'node-html-parser';

interface ParseOutput {
	/** SSML for synthesized speech. */
	ssml: string;

	/**
	 * Collection of items that could not be synthesized.
	 * Like images, tables, links etcentera.
	 * Will be wrapped in paragraph tags.
	 * */
	showNotesHTML: string[];
}

export default function htmlToSSml(html: string): string {
	const parsed = parser(html);
	const paragraphs = parsed.querySelectorAll('p');
	const sentencesInParagraphs = paragraphs
		.map(p => {
			return p.text
				.split(/\.\s+/)
				.map(s => `<s>${s}</s>`)
				.join('\n');
		})
		.map(p => `<p>\n${p}\n</p>`)
		.join('\n');
	return sentencesInParagraphs;
}
