import * as fs from 'fs';
import * as path from 'path';
import * as tmp from 'tmp-promise';
import * as child_process from 'child_process';

import { transliterateText } from 'polydictyl-lib';

export default async function dictate(input: string) {
	const text = fs.readFileSync(path.resolve(process.cwd(), input), 'utf8');
	const readStream = transliterateText(text, 'Amy', 'ogg_vorbis');
	const tmpFile = await tmp.file({ postfix: '.ogg', keep: true });
	const writeStream = fs.createWriteStream(tmpFile.path);

	readStream.pipe(writeStream).on('close', () => {
		child_process.exec(`xdg-open ${tmpFile.path}`);
	});
}
