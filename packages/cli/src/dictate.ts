import * as fs from "fs";
import * as path from "path";
import * as tmp from "tmp-promise";
import * as open from "open";

import { transliterateText } from "polydictyl-lib";

export default async function dictate(input: string) {
	const text = fs.readFileSync(path.resolve(process.cwd(), input), "utf8");
	const readStream = transliterateText(text, "Amy", "ogg_vorbis");
	const tmpFile = await tmp.file({ postfix: ".ogg" });
	const writeStream = fs.createWriteStream(tmpFile.path);

	readStream.pipe(writeStream).on("close", () => {
		console.log("wrote to", tmpFile.path);
		open(tmpFile.path);
	});
}
