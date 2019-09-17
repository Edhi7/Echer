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
		}, 35 * (i + 1));
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
	const ボタン = document.getElementById("add-friend");
	ボタン.addEventListener("mouseup", display_add_fren, { passive: true });
}

function display_add_fren() {
	open_dialog("Add a new friend", `<div class="dialog-header">
			<div class="dialog-tab active" data-target="send">Send</div>
			<div class="dialog-tab" data-target="recieve">Recieve</div>
		</div>
		<div class="dialog-destination active" data-name="send">
			<div class="add-fren form-element form-input">
				<input id="friend_search_bar" class="form-element-field"
					placeholder="" type="input" required />
				<div class="form-element-bar"></div>
				<label class="form-element-label" for="friend-search-bar">
					Search for friends</label>
			</div>
			<div class="add-fren-results"></div>
		</div>
		<div class="dialog-destination"
			data-name="recieve" style="display: none;">
			No one wants to be your friend.
		</div>
		`);
	const dialog = document.getElementsByClassName("dialog")[0];
	const input = dialog.getElementsByTagName("input")[0];
	const tabs = dialog.getElementsByClassName("dialog-tab");
	input.addEventListener("keydown",
		(e) => requestAnimationFrame(() => search_for_frens(e)));
	for (let tab of tabs)
		tab.addEventListener("click", display_dialog_tab);
	display_friend_requests(dialog);
}

function display_friend_requests(dialog) {
	const container = dialog
		.querySelector(".dialog-destination[data-name='recieve']");
	const user_id = firebase.auth().currentUser.uid;
	let i = 0;
	fs.collection("friend-requests").doc(user_id).get().then((doc) => {
		if (doc.exists) {
			const 可能な友達 = doc.data().sender;
			for (const snd of 可能な友達) {
				fs.collection("users").doc(snd).get().then(ユーザー => {
					if (ユーザー.exists) {
						if (i == 0)
							container.innerText = "";
						container.innerHTML += `<div class="contact active">
							<img class="contact-image"/>
								<section class="contact-text">
									<div class="contact-name"></div>
									<div class="contact-last-message">
										Accept friend request
									</div>
								</section>
							</div>`;
						const data = ユーザー.data();
						container.getElementsByClassName("contact-image")[i]
							.src = data.image;
						container.getElementsByClassName("contact-name")[i]
							.innerText = data.display;
						container.getElementsByClassName("contact")[i]
							.addEventListener("click", (e) =>
								accept_friend_request(e, snd));
						i++;
					}
				});
			}
		}
	});
}

function accept_friend_request(e, uid) {
	const user_id = firebase.auth().currentUser.uid;
	fs.collection("friendlists").doc(user_id).set({
		uid: firebase.firestore.FieldValue.arrayUnion(uid)
	}, { merge: true });
	fs.collection("accepted-friends").doc(user_id).set({
		uid: firebase.firestore.FieldValue.arrayUnion(uid)
	}, { merge: true });
}

function display_dialog_tab(e) {
	const tab = e.target;
	const tabs = document.getElementsByClassName("dialog-tab");
	const target = tab.getAttribute("data-target");
	const dst = document.getElementsByClassName("dialog-destination");
	for (let t of tabs)
		t.classList.remove("active");
	tab.classList.add("active");
	for (let d of dst) {
		if (d.getAttribute("data-name") != target) {
			d.classList.remove("active");
			d.setAttribute("style", "display: none;");
		} else {
			d.setAttribute("style", "display: block;");
			window.setTimeout(() => d.classList.add("active"), 100);
		}
	}
}

function search_for_frens(e) {
	const name = e.target.value;
	const results = e.target.parentNode.parentNode
		.getElementsByClassName("add-fren-results")[0];
	const users = fs.collection("users");
	const query = users.where("display", "==", name);
	let i = 0;
	query.get().then((qs) => {
		results.innerHTML = "";
		qs.forEach((doc) => {
			const data = doc.data();
			const user_id = firebase.auth().currentUser.uid;
			// You can't become friends with yourself
			if (doc.id != user_id) {
				results.innerHTML += `<div class="contact active">
					<img class="contact-image"/>
					<section class="contact-text">
						<div class="contact-name"></div>
						<div class="contact-last-message">
							Send a friend-request</div>
					</section>
				</div>`;
				requestAnimationFrame(() => {
					/* todo: add animation */
					results.getElementsByClassName("contact")[i]
						.addEventListener("click",
							() => send_friend_request(doc.id));
					results.getElementsByClassName("contact-image")[i]
						.src = data.image;
					results.getElementsByClassName("contact-name")[i]
						.innerText = data.display;
					i++;
				});
			}
		});
	}).catch((e) => console.log(e));
}

function send_friend_request(uid) {
	const user_id = firebase.auth().currentUser.uid;
	const frq = fs.collection("friend-requests").doc(uid);
	const prq = fs.collection("private-requests").doc(user_id);
	frq.set({ sender: firebase.firestore.FieldValue.arrayUnion(user_id) },
		{ merge: true });
	prq.set({ recipent: firebase.firestore.FieldValue.arrayUnion(uid) },
		{ merge: true });
	fs.collection("users").doc(uid).get()
		.then((doc) =>
			display_snackbar("Sent friend request to " + doc.data().display));
}

function set_contact_on_click() {
	const contacts = document.getElementsByClassName("contact");
	for (const contact of contacts) {
		// For some reason click works only about half of the time
		// It sometimes stops working for a while and then it works again
		// I'm using a mouseup event listener instead
		// and it seems to be working fine
		contact.addEventListener("mouseup", contact_click, false);
	}
}

function contact_click() {
	open_dialog(this.getElementsByClassName("contact-name")[0].innerText,
		`<div class="conversation-input-container">
		<input id="message-input" class="form-element-field" placeholder="" type="input" required />
		<div class="form-element-bar"></div>
		<label class="form-element-label" for="message-input">Type a message</label>
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			<path fill="#cacaca" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
			<path d="M0 0h24v24H0z" fill="none"/>
		</svg>
	</div>`);
	requestAnimationFrame(() =>
		document.getElementsByClassName("dialog")[0].getElementsByTagName("input")[0]
			.addEventListener("keydown", (e) =>
				requestAnimationFrame(() =>
					type_message_on_keydown(e))));
}

function open_dialog(title, content) {
	close_all_dialogs();
	const node = document.createElement('div');
	node.classList.add("dialog");
	node.innerHTML = `<div class="dialog-footer">
		<div class="close-dialog" onclick="close_dialog(this)">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<path fill = #f5f5f5 d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
				<path d="M0 0h24v24H0z" fill="none"/>
			</svg>
		</div>
		<div class="dialog-name">${title}</div>
	</div>
	` + content;
	hide_footer();
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
	show_footer();
}

function close_dialog(button) {
	button.parentNode.parentNode.classList.remove("open");
	window.setTimeout(close_all_dialogs, 100);
}

function hide_footer() {
	document.getElementById("bottom-navigation")
		.classList
		.remove("slide-in");
}

function show_footer() {
	document.getElementById("bottom-navigation")
		.classList
		.add("slide-in");
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
	check_friend_requests();
}

function check_friend_requests() {
	const user_id = firebase.auth().currentUser.uid;
	const query = fs.collection("accepted-friends")
		.where("uid", "array-contains", user_id);
	query.get().then((snp) => {
		snp.forEach((doc) => {
			fs.collection("friendlists").doc(user_id).set({
				uid: firebase.firestore.FieldValue.arrayUnion(doc.id)
			}, { merge: true });
		});
	});
}

function populate_contact_list(user_id) {
	const contact_container = document.getElementById("contact-list");
	fs.collection("friendlists").doc(user_id).get().then((doc) => {
		const friendlist = doc.data().uid;
		if (!doc.exists || friendlist == undefined)
			return;
		/* todo: make a screen telling the user that he has no friends */
		for (const friend of friendlist) {
			if (friend != undefined) {
				fs.collection("users").doc(friend).get().then((fdoc) => {
					const data = fdoc.data();
					contact_container.innerHTML +=
						`<div class="contact ripple active">
						<img class="contact-image" alt="Profile picture"
							src="${data.image}" />
						<section class="contact-text">
							<div class="contact-name">${data.display}</div>
							<div class="contact-last-message">Hej feto</div>
						</section>
					</div>`
					requestAnimationFrame(display_chat);
				});
			}
		};
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
		user.name = "はかせ";
	}).catch(function (error) {
		const error_code = error.code;
		const error_message = error.message;
		const email = error.email;
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
					display: display_name,
					image: "/images/apple-touch-icon.png",
				})
			}).catch((error) => {
				if (!error.code == "auth/email-already-in-use")
					console.log(error.code);
				display_snackbar(error.message);
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
	}
	return false;
}
