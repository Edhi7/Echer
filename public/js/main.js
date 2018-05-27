"use strict";

window.onload = main;

function main() {
	register_service_worker();
	check_logged_in();
	set_textcolor_appbar();
	set_menu_button_click();
}

function set_menu_button_click() {
	const menu_button = document.getElementById("menu-button");
	menu_button.onclick = function() {
		menu_button.classList.add("active");
	};
}

function register_service_worker() {
	/* Uncomment to enable serviceworker
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker
			.register('/sw.js')
			.then(function (registration) {
				//console.log('Service Worker Registered');
			});
		navigator.serviceWorker.ready.then(function (registration) {
			//console.log('Service Worker Ready');
		});
	} */
}

function check_logged_in() {
	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			logged_in(user);

		} else {
			// Display login form
			// ...
			display_login();
		}
	});
}

function display_login() {
	const form = document.getElementById("login")
	form.classList.add("fadeIn");
	form.getElementsByTagName("input")[0].click();
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
	console.log("Logged in as " + email);
	firebase.auth().signOut().then(function() {
		console.log("Signed out " + email)
	}, function(error) {
		display_snackbar(error.code)
	});
}

function validate_login_form(form) {
	"use strict";
	const inputs = Array.prototype.slice.call(
		form.getElementsByTagName("input")
	);

	let valid = true;
	let values = [];
	inputs.forEach((input) => {
		if (input.validity.valid) {
			values.push(input.value);
		} else {
			valid = false;
		}
	});

	// Return false if form is invalid, else return form values
	return valid ? values : valid;
}


function set_textcolor_appbar() {
	// Display the fonts initally hidden
	document.getElementById("app-bar").style.color = "#ffffff";
}

function display_snackbar(message) {
	var snackbar = document.createElement("div");
	snackbar.classList.add("snackbar");
	snackbar.innerText = message;
	document.body.appendChild(snackbar);

	// Wait a bit to make sure snackbar is loaded
	window.setTimeout(function () {
		snackbar.classList.add("slideUp");
		window.setTimeout(function () {
			// let the user read for 3.5s
			snackbar.classList.remove("slideUp");
			window.setTimeout(function () {
				// Remove on animation finish
				snackbar.parentNode.removeChild(snackbar);
			}, 225);
		}, 3500);
	}, 25);
}

function display_loader_in_form(form) {
	// TODO
	window.setTimeout(() => {
		form.parentNode.innerHTML += `<div class="preloader-wrapper active centered">
						<div class="spinner-layer">
							<div class="circle-clipper left">
								<div class="circle"></div>
							</div>
							<div class="gap-patch">
								<div class="circle"></div>
							</div>
							<div class="circle-clipper right">
								<div class="circle"></div>
							</div>
						</div>
					</div>`;
	}, 375);
}

function google_sign_in() {
	var provider = new firebase.auth.GoogleAuthProvider();
	firebase.auth().signInWithPopup(provider).then(function (result) {
		// This gives you a Google Access Token. You can use it to access the Google API.
		var token = result.credential.accessToken;
		// The signed-in user info.
		var user = result.user;
	}).catch(function (error) {
		console.log("Google sign in failed");
		// Handle Errors here.
		var error_code = error.code;
		console.log(error_code);
		var error_message = error.message;
		console.log(errorMessage);
		// The email of the user's account used.
		var email = error.email;
		// The firebase.auth.AuthCredential type that was used.
		var credential = error.credential;
		// ...
	});
}

function github_sign_in() {
	var provider = new firebase.auth.GithubAuthProvider();
	firebase.auth().signInWithPopup(provider).then(function (result) {
		// This gives you a GitHub Access Token. You can use it to access the GitHub API.
		var token = result.credential.accessToken;
		// The signed-in user info.
		var user = result.user;
		// ...
	}).catch(function (error) {
		// Handle Errors here.
		var error_code = error.code;
		var error_message = error.message;
		// The email of the user's account used.
		var email = error.email;
		// The firebase.auth.AuthCredential type that was used.
		var credential = error.credential;
		// ...
	});
}

function submit_signup_form(button) {
	const form = button.parentNode;
	const login_container = form.parentNode;

	const form_vailidation = validate_login_form(form);
	if (form_vailidation === false) {
		display_snackbar("Form input is invalid, please try again");
	} else {
		const email = form_vailidation[0];
		const password = form_vailidation[1];
		// Form was valid
		firebase.auth().createUserWithEmailAndPassword(email, password).catch((error) => {
			if (error.code == "auth/email-already-in-use") {
				// Sign in if singup not successful
				firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
					display_snackbar(error.message);
				});
			} else {
				console.log(error.code)
				display_snackbar(error.message);
			}
		});
	}
}