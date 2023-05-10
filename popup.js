document.addEventListener('DOMContentLoaded', () => {
	const startRecordingButton = document.getElementById('startRecording');
	const stopRecordingButton = document.getElementById('stopRecording');

	const port = chrome.runtime.connect({ name: 'startstop' });

	startRecordingButton.addEventListener('click', () => {
		console.log('start button clicked!');
		// chrome.runtime.sendMessage({ action: 'startRecording' });
		port.postMessage({ message: 'startRecording' });

		port.onMessage.addListener(function (msg) {
			console.log(msg.message);
		});
	});

	stopRecordingButton.addEventListener('click', () => {
		console.log('stop button clicked!');
		// chrome.runtime.sendMessage({ action: 'stopRecording' });
		port.postMessage({ message: 'stopRecording' });
	});
});
