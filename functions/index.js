const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

const fs = admin.firestore();


exports.sendNewMessageNotification = functions.firestore.document("groups/{group_id}/messages/{message_id}")
	.onWrite(async (change, context) => {
		const group = context.params.group_id;
		const message = context.params.message_id;

		const message_data = change.after.data();
		const sender_id = message_data.sender;
		const message_text = message_data.text;

		// If a message deleted we exit the function.
		if (!change.after.exists) {
			console.log("The message ", message, " was deleted from the group ", group);
			return;
		}

		const group_data = await fs.doc(`groups/${group}`).get()
		const members = group_data.data().members;

		let user_data_promises = [];
		for (const uid of members) {
			console.log(uid, " får meddelande från ", sender_id);
			// Do not send notifications to the sender
			if (uid == sender_id)
				continue;
			user_data_promises.push(fs.doc(`users/${uid}`).get());
		}

		const sender = await fs.doc(`users/${sender_id}`).get();
		const sender_data = sender.data();
		const sender_name = sender_data.display;
		const sender_image = sender_data.image;
		const payload = {
			notification: {
				title: `New message from ${sender_name}`,
				body: message_text,
				icon: sender_image
			},
			data: {
				group_id: group
			},
			/*webpush: {
				fcm_options: {
					link: `https://echeveria-runyonii.web.app?msg_from=${group}`
				}
			}*/
		};

		const user_data = await Promise.all(user_data_promises);
		let notif_tokens = [];
		let token_user_ref = [];
		for (const user of user_data) {
			const data = user.data();
			if (data.notification_tokens) {
				for (const token of data.notification_tokens) {
					notif_tokens.push(token);
					token_user_ref.push(user.ref);
				}
			}
		}

		console.log(notif_tokens);
		const response = await admin.messaging().sendToDevice(notif_tokens, payload);
		// For each message check if there was an error.
		let tokens_to_remove = [];
		response.results.forEach((result, index) => {
			const error = result.error;
			if (error) {
				console.error("Failure sending notification to ", notif_tokens[index]);
				// Cleanup the tokens that are no longer registered.
				if (error.code === 'messaging/invalid-registration-token' ||
					error.code === 'messaging/registration-token-not-registered') {
					console.log("Tar bort token ", notif_tokens[index]);
					tokens_to_remove.push(token_user_ref[index].update({
						notification_tokens: admin.firestore.FieldValue.arrayRemove(notif_tokens[index])
					}));
				}
			} else
				console.log(result);
		});

		console.log("/////////////////// SlUT PÅ RESULTAT");

		return await Promise.all(tokens_to_remove);
	});