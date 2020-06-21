"use strict";

importScripts('/app/js/cache-polyfill.js');

const CACHE = "ルニョニー";

self.addEventListener('fetch', function (event) {
	event.respondWith(
		caches.match(event.request)
			.then(response => {
				if (response) {
					return response;
				}

				return fetch(event.request).then(
					response => {
						if (!response || response.status !== 200 || response.type !== 'basic') {
							return response;
						}

						var responseToCache = response.clone();
						caches.open(CACHE)
							.then(cache => {
								cache.put(event.request, responseToCache);
							});
						return response;
					}
				);
			})
	);
});

self.addEventListener('install', event => {
	event.waitUntil(precache());
});

function precache() {
	caches.open(CACHE).then(cache =>
		cache.addAll([
			`/app/`,
			`/app/js/main.js`,
			`/app/js/ripple.js`,
			`/app/css/main.css`,
			`/app/css/field.css`,
			`/__/firebase/7.2.0/firebase-app.js`,
			`/__/firebase/7.2.0/firebase-auth.js`,
			`/__/firebase/init.js`
		]));
}
