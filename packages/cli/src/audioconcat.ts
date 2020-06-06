import * as tmp from 'tmp-promise';

import * as child_process from 'child_process';

export default async function audioconcat(files: string[]): Promise<string> {
	const tmpFile = await tmp.file({
		prefix: 'concatted-file',
		postfix: '.ogg',
		keep: true
	});
	return new Promise((resolve, reject) => {
		const cmd = `ffmpeg -y -i "concat:${files.join('|')}" -c:a libvorbis ${
			tmpFile.path
		}`;
		const ffmpeg = child_process.exec(cmd, err => {
			if (!err) resolve(tmpFile.path);
			else reject(err);
		});
	});
}
