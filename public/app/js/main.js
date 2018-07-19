"use strict";

window.onload = main;

function main() {
	// Serviceworker is anoying during debugging
	//register_service_worker();
	set_text_color();
	scale_in_title();
	window.setTimeout(() => {
		fade_out_title();
		set_bottom_navigation_click();
		check_logged_in();
	}, 500);
	// Don't have a menu button yet
	// set_menu_button_click();

}

function set_menu_button_click() {
	const menu_button = document.getElementById("menu-button");
	menu_button.onclick = () => {
		menu_button.classList.add("active");
	};
}

function set_bottom_navigation_click() {
	// Set onclick for each destination
	const targets = document
		.getElementsByClassName("bottom-navigation-destination");
	for (const target of targets) {
		target.addEventListener("click", bottom_navigation_click);
	}
}

function bottom_navigation_click(event) {
	// Give only clicked destination active class and remove it from others 
	const element = event.currentTarget;
	const siblings = element.parentNode
		.getElementsByClassName("bottom-navigation-destination");
	let clicked_el_index;
	for (let i = 0; i < siblings.length; i++) {
		siblings[i].classList.remove("active");
		if (siblings[i] === event.currentTarget) {
			clicked_el_index = i;
		}
	}
	hide_top_level_destinations();
	element.classList.add("active");
	//  Call corresponding displaying function
	window.setTimeout([display_map, display_chat, display_account][clicked_el_index], 125);
}

function hide_top_level_destinations() {
	// Display hide animation
	const destinations = document.getElementsByClassName("top-level-destination");
	for (const destination of destinations) {
		destination.classList.remove("active");
	}

	// Actually hide content
	window.setTimeout(() => {
		for (const destination of destinations) {
			destination.style.display = "none";
		}
	}, 120);
}

function display_map() {
	document.getElementById("map-screen").style.display = "block";
	window.setTimeout(() => {
		document.getElementById("map-screen").classList.add("active");
	}, 25);
}

function display_chat() {
	document.getElementById("chat-screen").style.display = "block";
	window.setTimeout(() => {
		document.getElementById("chat-screen").classList.add("active");
	}, 25);

	set_contact_on_click();
}

function display_account() {
	document.getElementById("account-screen").style.display = "block";
	window.setTimeout(() => {
		document.getElementById("account-screen").classList.add("active");
	}, 25);
}

function set_contact_on_click() {
	const contacts = document.getElementsByClassName("contact");
	for (const contact of contacts) {
		contact.onclick = contact_click;
	}
}

function contact_click() {
	close_all_conversations();
	const name = this.getElementsByClassName("contact-name")[0].innerHTML;
	const node = document.createElement('div');
	node.classList.add("conversation")
	node.innerHTML = `<div class="conversation-toolbar">
		<div class="close-conversation" onclick="close_conversation(this)">
			<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="36px"
				 height="36px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
				<g id="Bounding_Boxes">
					<path fill="none" d="M0,0h24v24H0V0z"/>
				</g>
				<g id="Sharp">
					<path fill="#f5f5f5" d="M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z"/>
				</g>
			</svg>
		</div>
		<div class="conversation-name">${name}</div>
	</div>`;
	document.getElementsByTagName('body')[0].append(node);
	requestAnimationFrame(() => 
		requestAnimationFrame(() =>  document.body.lastChild.classList.add("open"))
	);
}

function close_all_conversations() {
	const conversations = document.getElementsByClassName("conversation");
	for(const c of conversations) {
		c.parentNode.removeChild(c);
	}
}

function close_conversation(button) {
	button.parentNode.parentNode.classList.remove("open");
}

function scale_in_title() {
	document.getElementById("app-title").classList.add("scale-in");
}

function fade_out_title() {
	document.body.classList.add("loaded");
	// Had to do this twice?
	requestAnimationFrame(function () {
		requestAnimationFrame(function () {
			const app_title = document.getElementById("app-title");
			app_title.classList.add("fade-out");
			/*window.setTimeout(() => {
				app_title.parentNode.removeChild(app_title);
			}, 255); */
		});
	});
}

function register_service_worker() {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker
			.register('/app/js/sw.js')
			.then(function (registration) {
				//console.log('Service Worker Registered');
			});
		navigator.serviceWorker.ready.then(function (registration) {
			console.log('Service Worker Ready');
		});
	}
}

function check_logged_in() {
	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			logged_in(user);
		} else {
			display_login_form();
		}
	});
}

function sign_out() {
	firebase.auth().signOut().then(function () {
		display_snackbar("Signed out");
	}).catch(function (error) {
		display_snackbar(error.message);
	});

}

function display_login_form() {
	const form = document.getElementById("login");
	form.classList.add("fade-in");
	form.getElementsByTagName("input")[0].click();
}

function hide_login_form() {
	const login = document.getElementById("login");
	login.classList.remove("fade-in");
}

function validate_form_if_enter(event) {
	if (event.key === "Enter") {
		const form = event.currentTarget.parentNode.parentNode;
		validate_login_form(form);
	}
}

function logged_in(user) {
	const displayName = user.displayName;
	const email = user.email;
	const emailVerified = user.emailVerified;
	const photoURL = user.photoURL;
	const isAnonymous = user.isAnonymous;
	const uid = user.uid;
	const providerData = user.providerData;
	display_logged_in_ui();
	console.log("Logged in as " + email +
		"\nUser id: " + uid +
		"\nDisplayname: " + user.displayName +
		"\nPhoto url: " + photoURL +
		"\nEmail verified: " + emailVerified);
	// TODO
}

function display_logged_in_ui() {
	fade_out_title();
	document.getElementById("bottom-navigation").classList.add("slide-in");
	document.getElementById("bottom-navigation").classList.remove("slide-in");
	requestAnimationFrame(() => 
		document.getElementById("bottom-navigation").classList.add("slide-in"));
	hide_login_form();
	requestAnimationFrame(() => login.style.display = "none");
	window.setTimeout(display_chat, 250);
	//Not used anymore since title is removed after loading finishes 
	//move_app_title();
}

function move_app_title() {
	// Not used anymore since title is removed after loading finishes
	const title = document.getElementById("app-title");
	title.parentNode.removeChild(title);
	document.getElementsByTagName("main")[0].prepend(title);
}

function validate_login_form(form) {
	"use strict";
	const inputs = form.getElementsByTagName("input");
	let valid = true;
	let values = [];
	for(const input of inputs)  {
		if (input.validity.valid) {
			values.push(input.value);
		} else {
			valid = false;
		}
	};
	// Return false if form is invalid, else return form values
	return valid ? values : valid;
}


function set_text_color() {
	// Display the fonts initally hidden
	document.body.parentNode.style.color = "rgba(0, 0, 0, 0.9)";
}

function display_snackbar(message) {
	const snackbar = document.createElement("div");
	snackbar.classList.add("snackbar");
	snackbar.innerText = message;
	document.body.appendChild(snackbar);
	requestAnimationFrame(function () {
		snackbar.classList.add("slideUp");
		window.setTimeout(function () {
			snackbar.classList.remove("slideUp");
			window.setTimeout(function () {
				snackbar.parentNode.removeChild(snackbar);
			}, 225);
		}, 3500);
	});
}

function display_loader_in_form(form) {
	// fug :D:D:D :D:D
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
	const provider = new firebase.auth.GoogleAuthProvider();
	firebase.auth().signInWithPopup(provider).then(function (result) {
		// This gives you a Google Access Token. You can use it to access the Google API.
		const token = result.credential.accessToken;
		// The signed-in user info.
		const user = result.user;
		user.naem = "jef :)";
	}).catch(function (error) {
		console.log("Google sign in failed");
		// Handle Errors here.
		const error_code = error.code;
		console.log(error_code);
		const error_message = error.message;
		console.log(errorMessage);
		// The email of the user's account used.
		const email = error.email;
		// The firebase.auth.AuthCredential type that was used.
		const credential = error.credential;
	});
}

function github_sign_in() {
	const provider = new firebase.auth.GithubAuthProvider();
	firebase.auth().signInWithPopup(provider).then(function (result) {
		// This gives you a GitHub Access Token. You can use it to access the GitHub API.
		const token = result.credential.accessToken;
		// The signed-in user info.
		const user = result.user;
	}).catch(function (error) {
		// Handle Errors here.
		const error_code = error.code;
		const error_message = error.message;
		// The email of the user's account used.
		const email = error.email;
		// The firebase.auth.AuthCredential type that was used.
		const credential = error.credential;
	});
}

function submit_signup_form(button) {
	console.log("Attempting login...")
	const form = button.parentNode;
	const form_vailidation = validate_login_form(form);
	if (form_vailidation === false) {
		display_snackbar("Ursäkta mig, herrn, men ni har fel format på lösenord eller typ email på något vis o.s.v.");
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