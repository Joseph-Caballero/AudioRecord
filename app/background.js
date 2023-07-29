let mediaRecorder;

chrome.runtime.onConnect.addListener(function (port) {
	let isRecording = false;
	console.assert(port.name == 'startstop');

	port.onMessage.addListener(function (msg) {
		if (msg.message === 'startRecording' && isRecording === false) {
			isRecording = true;

			const tabCaptureOptions = {
				audio: true,
				video: false,
				audioConstraints: {
					mandatory: {
						chromeMediaSource: 'tab',
						echoCancellation: true,
						chromeMediaSourceAudioCaptureAllowed: true,
					},
				},
			}

			function handleStream(stream){
				if (chrome.runtime.lastError) {
					console.error(chrome.runtime.lastError);
					return;
				}
			
				// Pass the audio stream to your audio recorder
				recordAudio(stream);
			}

			chrome.tabs.query({ active: true }, () => {chrome.tabCapture.capture( tabCaptureOptions, handleStream)});

		} else if (msg.message === 'stopRecording' && isRecording === true && mediaRecorder && mediaRecorder.state === 'recording') {
				isRecording = false;
				mediaRecorder.stop()}
	});
});

function recordAudio(stream) {
	const options = { mimeType: 'audio/webm' };
	let recordedChunks = [];

	const output = new AudioContext();
	const source = output.createMediaStreamSource(stream);
	source.connect(output.destination);

	mediaRecorder = new MediaRecorder(stream, options);
	mediaRecorder.ondataavailable = (event) => { event.data.size > 0 ? recordedChunks.push(event.data) : console.log(event.data)}
	mediaRecorder.start();

	mediaRecorder.onstop = async () => {
		await convertAndDownload(recordedChunks);
		recordedChunks = [];
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}
	};
}

function convertAndDownload(recordedChunks) {
	let blob = new Blob(recordedChunks, { type: 'audio/webm' });

	let url = URL.createObjectURL(blob);
	let downloadName = `recorded_audio_${Date.now()}.webm`;

	chrome.downloads.download({
		url: url,
		filename: downloadName,
	});
}
