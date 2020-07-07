"use strict";

importScripts('/app/js/cache-polyfill.js');

const CACHE = "ルニョニー";

self.addEventListener("fetch", event => {
	event.respondWith(respond(event));
});

async function respond(event) {
	// Let cache open in background
	const cache_promise = caches.match(event.request);

	let fetched_response;
	try {
		fetched_response = await fetch(event.request);
	} catch (error) {
		return cache_promise;
	}

	// Choose if we use the cache or fetched response
	if (!fetched_response || fetched_response.status !== 200) {
		const cache_response = await cache_promise;
		if (cache_response != undefined) {
			return cache_response;
		} else {
			// Return erronious response
			return fetched_response;
		}
	} else {
		// Only cache same-origin requests
		if (fetched_response.type === 'basic') {
			// Cache and respond with fetched response
			var response_to_be_cached = fetched_response.clone();
			const opened = await caches.open(CACHE);
			opened.put(event.request, response_to_be_cached);
		}
		return fetched_response;
	}
}

self.addEventListener("install", event => {
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
