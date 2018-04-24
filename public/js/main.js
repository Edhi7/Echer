"use strict";

window.onload = main;
function main() {
	register_service_worker();
	check_logged_in();
}

function register_service_worker() {
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker
			.register("/js/service_worker.js")
			.then(function () {
				console.log("My nam jeff - Hacking ur mom succesful");
			});
	}
}

function check_logged_in() {
	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			logged_in(user)

		} else {
			// Display login form
			// ...
			display_login();
		}
	});
}

function display_login() {
	document.getElementById("login").className = "fadeIn";
	document.getElementById("splash-logo").className = "fadeUp";
}

function logged_in(user) {
	// User is signed in.
	const displayName = user.displayName;
	const email = user.email;
	const emailVerified = user.emailVerified;
	const photoURL = user.photoURL;
	const isAnonymous = user.isAnonymous;
	const uid = user.uid;
	const providerData = user.providerData;
	const app_bar = document.getElementById("app-bar");
	app_bar.classList.add("float-up");
}