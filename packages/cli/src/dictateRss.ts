import * as fs from 'fs';
import * as stream from 'stream';
import * as child_process from 'child_process';

import audioconcat from './audioconcat';

import * as tmp from 'tmp-promise';
import * as Parser from 'rss-parser';
import Split from 'ssml-split';

import { transliterateSSML } from 'polydictyl-lib';
import htmlToSSml from './htmlToSSml';

const parser = new Parser();

const split = new Split({
	synthesizer: 'aws',
	softLimit: 2000,
	hardLimit: 3000,
	breakParagraphsAboveHardLimit: true
});

const sessionDirP = tmp.dir({ keep: true, prefix: 'polydictyl-session-' });

async function streamToFile(stream: stream.Readable) {
	const sessionDir = await sessionDirP;
	const tmpFile = await tmp.file({
		postfix: '.ogg',
		keep: true,
		dir: sessionDir.path
	});

	return new Promise<tmp.FileResult>((resolve, reject) => {
		const writeStream = fs.createWriteStream(tmpFile.path);

		stream.on('error', reject);

		stream
			.pipe(writeStream)
			.on('close', () => resolve(tmpFile))
			.on('error', reject);
	});
}

async function dictate(ssml: string) {
	const translateStream = transliterateSSML(ssml, 'Matthew', 'ogg_vorbis');
	return streamToFile(translateStream);
}

async function splitAndDictate(ssml: string): Promise<string> {
	const batches = split.split(ssml);
	if (batches.length === 1) {
		const result = await dictate(batches[0]);
		return result.path;
	} else {
		const files = await Promise.all(batches.map(dictate));
		const concatted = await audioconcat(files.map(f => f.path));
		return concatted;
	}
}

async function dictateManyText(contents: string[]) {
	return Promise.all(contents.map(splitAndDictate));
}

function itemToText(item: Parser.Item) {
	const content =
		item['content:encoded'] ||
		item.content ||
		'This article contains no content.';
	const title = `<p><s>${item.title}</s></p>`;
	const text = [
		title,
		`<break strength="x-strong" />`,
		htmlToSSml(content)
	].join('\n');

	return `<speak>\n${text}\n</speak>`;
}

export default async function dictateRss(url: string) {
	const feed = await parser.parseURL(url);
	const contents = feed.items!.map(itemToText);
	const itemFiles = await dictateManyText(contents);
	const concattedPath = await audioconcat(itemFiles);
	child_process.exec(`xdg-open ${concattedPath}`);
}
