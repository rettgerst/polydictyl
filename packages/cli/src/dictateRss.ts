import * as fs from 'fs';
import * as stream from 'stream';
import * as child_process from 'child_process';

import audioconcat from './audioconcat';

import * as tmp from 'tmp-promise';
import * as Parser from 'rss-parser';
import * as htt from 'html-to-text';

import { transliterateText } from 'polydictyl-lib';

const parser = new Parser();

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

		stream
			.pipe(writeStream)
			.on('close', () => resolve(tmpFile))
			.on('error', reject);
	});
}

function dictateManyText(contents: string[]) {
	return Promise.all(
		contents.map(async (text, index) => {
			const translateStream = transliterateText(text, 'Matthew', 'ogg_vorbis');
			return streamToFile(translateStream);
		})
	);
}

function itemToText(item: Parser.Item) {
	const content =
		item['content:encoded'] ||
		item.content ||
		'This article contains no content.';
	const text = [
		item.title,
		htt.fromString(content, {
			ignoreHref: true,
			ignoreImage: true
		})
	].join('\n');

	if (text.length > 3000)
		return [item.title, 'Sorry, this article is too long to dictate.'].join(
			'\n\n'
		);
	else return text;
}

export default async function dictateRss(url: string) {
	const feed = await parser.parseURL(url);
	const contents = feed.items!.map(itemToText);
	contents.forEach((value, index) => {
		console.log(`item ${index + 1}:`);
		console.log(value);
		console.log('\n');
	});
	const itemFiles = await dictateManyText(contents);
	const concattedPath = await audioconcat(itemFiles.map(t => t.path));
	console.log('concattedpath:', concattedPath);
	child_process.exec(`xdg-open ${concattedPath}`);
}
