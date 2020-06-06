import { Polly } from 'aws-sdk';

const p = new Polly({ region: 'us-east-1' });

export function transliterateText(
	Text: string,
	VoiceId: Polly.VoiceId,
	OutputFormat: Polly.OutputFormat
) {
	return p.synthesizeSpeech({ Text, VoiceId, OutputFormat }).createReadStream();
}

export function transliterateSSML(
	Text: string,
	VoiceId: Polly.VoiceId,
	OutputFormat: Polly.OutputFormat
) {
	return p
		.synthesizeSpeech({
			Text,
			TextType: 'ssml',
			VoiceId,
			OutputFormat,
			Engine: 'neural'
		})
		.createReadStream();
}
