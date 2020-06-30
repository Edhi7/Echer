
importScripts('https://www.gstatic.com/firebasejs/7.15.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.15.0/firebase-messaging.js');

const firebase_config = {
	apiKey: "AIzaSyCqL0Pk52gfrwdULf-7Mkh7-iSf6nRo7-o",
	authDomain: "echeveria-runyonii.firebaseapp.com",
	databaseURL: "https://echeveria-runyonii.firebaseio.com",
	projectId: "echeveria-runyonii",
	storageBucket: "echeveria-runyonii.appspot.com",
	messagingSenderId: "1067212376379",
	appId: "1:1067212376379:web:e23bddabca85989ddb4f1e"
};

firebase.initializeApp(firebase_config);
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
	console.log('Received background message ', payload);
	// Customize notification here
	const notificationTitle = 'Background Message Title';
	const notificationOptions = {
		body: 'Background Message body.',
		icon: '/firebase-logo.png'
	};

	return self.registration.showNotification(notificationTitle,
		notificationOptions);
});
