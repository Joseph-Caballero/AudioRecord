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
			if (msg.message === `You sent startRecording to the background!`) {
				startRecordingButton.style.background = '#FF5252';
				startRecordingButton.style.boxShadow = '2px 2px 4px #000000';
			}
			if (msg.message === `You sent stopRecording to the background!`) {
				startRecordingButton.style.backgroundColor = '#999999';
				startRecordingButton.style.boxShadow = '1px 1px 2px #000000';
			}
		});
	});

	stopRecordingButton.addEventListener('click', () => {
		console.log('stop button clicked!');
		// chrome.runtime.sendMessage({ action: 'stopRecording' });
		port.postMessage({ message: 'stopRecording' });
	});
});
