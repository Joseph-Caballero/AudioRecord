async function convertAndDownload(recordedChunks) {
	let blob = new Blob(recordedChunks, { type: 'audio/webm' });
	let audioBuffer = await blobToAudioBuffer(blob);

	const mp3Data = encodeAudioBufferToMp3(audioBuffer);

	let mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' });
	let url = URL.createObjectURL(mp3Blob);
	let downloadName = `recorded_audio_${Date.now()}.mp3`;

	// Download the MP3 file to the user's device
	chrome.downloads.download({
		url: url,
		filename: downloadName,
	});
}

async function blobToAudioBuffer(blob) {
	return new Promise(async (resolve) => {
		const audioContext = new AudioContext();
		const arrayBuffer = await blob.arrayBuffer();
		audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
			resolve(audioBuffer);
		});
	});
}

function encodeAudioBufferToMp3(audioBuffer) {
	const channels = 1;
	const sampleRate = audioBuffer.sampleRate;
	const kbps = 128;
	const samples = audioBuffer.getChannelData(0);

	const lameEncoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
	const blockSize = 1152;
	const outputData = [];

	for (let i = 0; i < samples.length; i += blockSize) {
		const buf = samples.subarray(i, i + blockSize);
		const mp3buf = lameEncoder.encodeBuffer(buf);
		if (mp3buf.length > 0) {
			outputData.push(new Uint8Array(mp3buf));
		}
	}

	const endBuffer = lameEncoder.flush();
	if (endBuffer.length > 0) {
		outputData.push(new Uint8Array(endBuffer));
	}

	return outputData;
}

let mediaRecorder;
let recordedChunks = [];

function recordAudio(stream) {
	const options = { mimeType: 'audio/webm' };
	mediaRecorder = new MediaRecorder(stream, options);
	mediaRecorder.ondataavailable = handleDataAvailable;
	mediaRecorder.start();

	mediaRecorder.onstop = async () => {
		await convertAndDownload(recordedChunks);
		recordedChunks = [];
	};
}

function handleDataAvailable(event) {
	if (event.data.size > 0) {
		recordedChunks.push(event.data);
	}
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'startRecording') {
		console.log('Action received by background!');
		// Start recording
		chrome.tabs.query({ active: true }, (tabs) => {
			// console.log(chrome);
			const tab = tabs[0];
			console.log(tab);
			chrome.tabCapture.capture(
				{
					audio: true,
					video: false,
					audioConstraints: {
						mandatory: {
							chromeMediaSource: 'tab',
							echoCancellation: true,
							chromeMediaSourceAudioCaptureAllowed: true,
						},
					},
				},
				(stream) => {
					if (chrome.runtime.lastError) {
						console.error(chrome.runtime.lastError);
						return;
					}

					// Pass the audio stream to your audio recorder
					recordAudio(stream);
				}
			);
		});
	} else if (message.action === 'stopRecording') {
		// Stop recording
		console.log('StopRecording message received by background!');
		if (mediaRecorder && mediaRecorder.state === 'recording') {
			mediaRecorder.stop();
		}
	}
});
