function convertAndDownload(recordedChunks) {
	let blob = new Blob(recordedChunks, { type: 'audio/webm' });

	let url = URL.createObjectURL(blob);
	let downloadName = `recorded_audio_${Date.now()}.webm`;

	// Download the MP3 file to the user's device
	chrome.downloads.download({
		url: url,
		filename: downloadName,
	});
}

let mediaRecorder;
let recordedChunks = [];

function recordAudio(stream) {
	const options = { mimeType: 'audio/webm' };

	// preserve the system audio so that when recording starts it doesn't cut off the system audio
	const output = new AudioContext();
	const source = output.createMediaStreamSource(stream);
	source.connect(output.destination);

	mediaRecorder = new MediaRecorder(stream, options);
	mediaRecorder.ondataavailable = handleDataAvailable;
	mediaRecorder.start();

	mediaRecorder.onstop = async () => {
		await convertAndDownload(recordedChunks);
		recordedChunks = [];
		stopTabCapture(stream);
	};
}

function stopTabCapture(mediaStream) {
	if (mediaStream) {
		mediaStream.getTracks().forEach((track) => track.stop());
		mediaStream = null;
	}
}

function handleDataAvailable(event) {
	if (event.data.size > 0) {
		recordedChunks.push(event.data);
	}
}

// create variable isRecording and set to false
let isRecording = false;

// long-lived connection using port??
chrome.runtime.onConnect.addListener(function (port) {
	console.assert(port.name == 'startstop');

	port.onMessage.addListener(function (msg) {
		port.postMessage({ message: `You sent ${msg.message} to the background!` });
		if (msg.message === 'startRecording' && isRecording === false) {
			// Start recording
			isRecording = true;
			chrome.tabs.query({ active: true }, (tabs) => {
				const tab = tabs[0];
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
		} else if (msg.message === 'stopRecording' && isRecording === true) {
			// Stop recording
			if (mediaRecorder && mediaRecorder.state === 'recording') {
				isRecording = false;
				mediaRecorder.stop();
			}
		}
	});
});
