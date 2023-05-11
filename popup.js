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
				startRecordingButton.style.background = '#FF7070';
				startRecordingButton.style.boxShadow = '0px 0px 0px 2px #333333';
				startRecordingButton.style.color = '#E4E4E4';
				startRecordingButton.style.border = '3px outset #fc5555';
			}
			if (msg.message === `You sent stopRecording to the background!`) {
				startRecordingButton.style.backgroundColor = '#fd3c3c';
				startRecordingButton.style.boxShadow = '2px 2px 4px #000000';
				startRecordingButton.style.color = '#FFFFFF';
				startRecordingButton.style.border = '3px outset #ff2a2a';
			}
		});
	});

	stopRecordingButton.addEventListener('click', () => {
		console.log('stop button clicked!');
		// chrome.runtime.sendMessage({ action: 'stopRecording' });
		port.postMessage({ message: 'stopRecording' });
	});
});
