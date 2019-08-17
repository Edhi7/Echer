"use strict";

window.onload = main;

const fs = firebase.firestore();

function main() {
	// Serviceworker is anoying during debugging
	// register_service_worker();
	scale_in_title();
	ripple_init();
	set_bottom_navigation_click();
	window.setTimeout(() => {
		check_logged_in();
	}, 500);
}

function set_menu_button_click() {
	const menu_button = document.getElementById("menu-button");
	menu_button.onclick = () => {
		menu_button.classList.add("active");
	};
}

function set_bottom_navigation_click() {
	// Set onclick for each destination
	const targets = document.getElementsByClassName("bottom-navigation-destination");
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
	element.classList.add("active");
	hide_top_level_destinations();
	// Call corresponding displaying function
	[display_map, display_chat, display_account][clicked_el_index]();

}

function hide_top_level_destinations() {
	// Display hiding animation
	const destinations = document
		.getElementsByClassName("top-level-destination");
	for (const destination of destinations) {
		destination.classList.remove("active");
	}
	const contacts = document.getElementById("contact-list").children;
	for (let contact of contacts)
		contact.classList.remove("active");
	// Actually hide
	window.setTimeout(() => {
		for (const destination of destinations) {
			if (!destination.classList.contains("active"))
				destination.style.display = "none";
		}
	}, 50);
}

function display_map() {
	document.getElementById("map-screen").style.display = "block";
	window.setTimeout(() => {
		document.getElementById("map-screen").classList.add("active");
	}, 40);
}

function display_chat() {
	const chat_screen = document.getElementById("chat-screen");
	const contacts = document.getElementById("contact-list").children;
	chat_screen.style.display = "block";
	for (let i = 0; i < contacts.length; i++) {
		window.setTimeout(() => {
			contacts[i].classList.add("active");
		}, 25 * i);
	}
	window.setTimeout(() => { chat_screen.classList.add("active") }, 25)
	set_add_fren_on_click();
	set_contact_on_click();
}

function display_account() {
	document.getElementById("account-screen").style.display = "block";
	window.setTimeout(() => {
		document.getElementById("account-screen").classList.add("active");
	}, 25);
}

function set_add_fren_on_click() {
	const botan = document.getElementById("add-fren");
	botan.addEventListener("mouseup", display_add_fren, { passive: true });
}

function display_add_fren() {
	open_dialog("Add a new friend", `<div class="add-fren form-input">
			<input id="friend_search_bar" class="form-element-field" placeholder="" 
			type="input" required />
			<div class="form-element-bar"></div>
			<label class="form-element-label" for="friend-search-bar">Enter the name of your friend</label>
		</div>
		<div class="add-fren-results">

		</div>`);
	const dialog = document.getElementsByClassName("dialog")[0];
	const input = dialog.getElementsByTagName("input")[0];
	input.addEventListener("keydown", (e) => requestAnimationFrame(() => search_for_frens(e)));
}

function search_for_frens(e) {
	const name = e.target.value;
	const results = e.target.parentNode.parentNode
		.getElementsByClassName("add-fren-results")[0];
	const users = fs.collection("users");
	const query = users.where("display", "==", name);
	query.get().then((qs) => {
		results.innerHTML = "";
		qs.forEach((doc) => {
			const data = doc.data();
			const user_id = firebase.auth().currentUser.uid;
			// You can't become friends with yourself
			if (doc.id != user_id) {
				results.innerHTML += `<div class="contact active"
					onclick="add_fren_to_friendlist('${doc.id}')">
					<img class="contact-image" src="${data.image}"/>
					<section class="contact-text">
						<div class="contact-name">${data.display}</div>
						<div class="contact-last-message">Add to your friendlist</div>
					</section>
				</div>`;
				console.log(doc.id);
				console.log(doc.data());
			}
		});
	}).catch((e) => console.log(e));
}

function add_fren_to_friendlist(uid) {
	const user_id = firebase.auth().currentUser.uid;
	fs.collection("users").doc(user_id).update({
		friends: firebase.firestore.FieldValue.arrayUnion(uid)
	});
}

function set_contact_on_click() {
	const contacts = document.getElementsByClassName("contact");
	for (const contact of contacts) {
		// For some reason click works only about half of the time
		// It sometimes stops working for a while and then it works again
		// Using these other event listeners and it seems to be working fine
		contact.addEventListener("mouseup", contact_click, false);
	}
}

function contact_click() {
	open_dialog(this.getElementsByClassName("contact-name")[0].innerText,
		`<div class="form-input
		conversation-input-container">
		<input id="message-input" class="form-element-field" placeholder="" type="input" required />
		<div class="form-element-bar"></div>
		<label class="form-element-label" for="message-input">Type a message</label>
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			<path fill="#cacaca" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
			<path d="M0 0h24v24H0z" fill="none"/>
		</svg>
	</div>`);
	requestAnimationFrame(() => {
		const dialog = document.getElementsByClassName("dialog")[0]; dialog.getElementsByTagName("input")[0]
			.addEventListener("keydown", (e) => {
				requestAnimationFrame(() => {
					type_message_on_keydown(e);
				});
			});
	});
}

function open_dialog(title, content) {
	close_all_dialogs();
	const node = document.createElement('div');
	node.classList.add("dialog");
	node.innerHTML = `<div class="dialog-toolbar">
		<div class="close-dialog" onclick="close_dialog(this)">
			<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px"
			height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
				<g id="Bounding_Boxes">
					<path fill="none" d="M0,0h24v24H0V0z"/>
				</g>
				<g id="Sharp">
					<path fill="#5a9271" d="M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z"/>
				</g>
   			</svg>
		</div>
		<div class="dialog-name">${title}</div>
	</div>
	` + content;
	document.getElementsByTagName('body')[0].append(node);
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			const dialog = document.getElementsByClassName("dialog")[0];
			dialog.classList.add("open");
		});
	});

}

function close_all_dialogs() {
	const dialog = document.getElementsByClassName("dialog");
	for (const c of dialog) {
		c.parentNode.removeChild(c);
	}
}

function close_dialog(button) {
	button.parentNode.parentNode.classList.remove("open");
	window.setTimeout(close_all_dialogs, 100);
}

function type_message_on_keydown(event) {
	//console.log(event.currentTarget.value)
	if (event.target.value != "") {
		event.target.parentNode.getElementsByTagName("svg")[0]
			.classList.add("active");
	} else {
		event.target.parentNode.getElementsByTagName("svg")[0]
			.classList.remove("active");
	}
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

function float_title() {
	document.getElementById("app-title")
		.classList
		.add("float-up");
}

function register_service_worker() {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker
			.register('/app/sw.js')
			.then(function (registration) {
				console.log('Service Worker Registered at scope ', registration.scope);
			});
		navigator.serviceWorker.ready.then(function (registration) {
			console.log('Service Worker Ready');
		});
	} else {
		console.log("Service worker is unavailable");
	}
}

function check_logged_in() {
	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			logged_in(user);
		} else {
			float_title();
			display_login_form();
		}
	});
}

function sign_out() {
	firebase.auth().signOut().then(function () {
		display_snackbar("Signed out");
		location.reload();
	}).catch(function (error) {
		display_snackbar(error.message);
	});

}

function display_login_form() {
	const form = document.getElementById("authentication");
	form.classList.add("fade-in");
	form.getElementsByTagName("input")[0].click();
}

function hide_login_form() {
	const login = document.getElementById("authentication");
	login.classList.remove("fade-in");
	fade_out_title();
}

function logged_in(user) {
	console.log("Logged in as " + user.email +
		"\nUser id: " + user.uid +
		"\nDisplayname: " + user.displayName +
		"\nPhoto url: " + user.photoURL +
		"\nEmail verified: " + user.emailVerified);
	if (user.displayName != null)
		display_snackbar("Signed in as " + user.displayName);
	// TODO fetch user data from firestore
	fs.collection("users").doc(user.uid).get().then((doc) => {
		if (doc.exists) {
			populate_contact_list(user.uid);
		}
	}).catch((e) => {
		console.log(e);
	});
	display_logged_in_ui();
}

function populate_contact_list(user_id) {
	// pouplate friends view
	const contact_container = document.getElementById("contact-list");
	const users_ref = fs.collection("users")
	users_ref.doc(user_id).get().then((doc) => {
		const friend_list = doc.data().friends;
		friend_list.forEach((friend) => {
			if (friend != null) {
				users_ref.doc(friend).get().then((fdoc) => {
					console.log(friend)
					if (fdoc.exists)
						console.log("dokumentet existerar som fan")
					const data = fdoc.data();
					contact_container.innerHTML += `<div class="contact ripple active">
						<img class="contact-image" alt="Profile picture"
							src="${data.image}" />
						<section class="contact-text">
							<div class="contact-name">${data.display}</div>
							<div class="contact-last-message>Hej feto</div>
						</section>
					</div>`
					requestAnimationFrame(display_chat);
				});
			}
		});
	});
}

function display_logged_in_ui() {
	fade_out_title();
	hide_login_form();
	window.setTimeout(() => {
		display_chat();
		login.style.display = "none";
	}, 250);
	window.setTimeout(() => {
		document.getElementById("bottom-navigation").classList.add("slide-in")
	}, 480);

	//Not used anymore since title is removed after loading finishes 
	//move_app_title();
}

function display_sign_in() {
	document.getElementById("authentication").classList.toggle("float-up");
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
	for (const input of inputs) {
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
	requestAnimationFrame(() =>
		requestAnimationFrame(() => {
			snackbar.classList.add("slideUp");
			window.setTimeout(() => {
				snackbar.classList.remove("slideUp");
				window.setTimeout(() => {
					snackbar.parentNode.removeChild(snackbar);
				}, 225);
			}, 3500);
		})
	);
}

function display_loader_in_form(form) {
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
		user.name = "hakase";
	}).catch(function (error) {
		console.log("Google sign in failed");
		// Handle Errors here.
		const error_code = error.code;
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
		const token = result.credential.accessToken;
		const user = result.user;
	}).catch(function (error) {
		const error_code = error.code;
		const error_message = error.message;
		const email = error.email;
		const credential = error.credential;
	});
}

function submit_signup_form(event) {
	const form = document.getElementById("signup");
	const form_vailidation = validate_login_form(form);
	if (form_vailidation === false) {
		display_snackbar("Your form values are incorrectly formated.");
	} else {
		const email = form_vailidation[0];
		const password = form_vailidation[1];
		const display_name = form_vailidation[2];
		// Form was valid
		firebase.auth().createUserWithEmailAndPassword(email, password)
			.then(() => {
				// TODO add user in database
				const user = firebase.auth().currentUser;
				const user_id = user.uid;
				user.updateProfile({
					displayName: display_name,
					photoURL: "/images/jeffo.png"
				});
				fs.collection("users").doc(user_id).set({
					email: email,
					display: display_name,
					friends: [null],
					groups: [null],
					image: "/images/apple-touch-icon.png",
				})
					.catch((e) => console.log(e));
			}).catch((error) => {
				if (error.code == "auth/email-already-in-use") {
					display_snackbar(error.message);
				} else {
					console.log(error.code);
					display_snackbar(error.message);
				}
			});
	}
	return false;
}

function submit_login_form(event) {
	const form = document.getElementById("login");
	const form_vailidation = validate_login_form(form);
	if (form_vailidation === false) {
		display_snackbar("Your email or password format is wrong.");
	} else {
		const email = form_vailidation[0];
		const password = form_vailidation[1];
		firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
			display_snackbar(error.message);
		});
		console.log(error.code);
		display_snackbar(error.message);
	}
	return false;
}
