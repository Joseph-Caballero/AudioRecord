document.addEventListener('DOMContentLoaded', () => {
	const startRecordingButton = document.getElementById('startRecording');
	const stopRecordingButton = document.getElementById('stopRecording');

	startRecordingButton.addEventListener('click', () => {
		console.log('start button clicked!');
		chrome.runtime.sendMessage({ action: 'startRecording' });
	});

	stopRecordingButton.addEventListener('click', () => {
		console.log('stop button clicked!');
		chrome.runtime.sendMessage({ action: 'stopRecording' });
	});
});
