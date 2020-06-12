"use strict";

importScripts('/app/js/cache-polyfill.js');

const CACHE = "ルニョニー";

self.addEventListener('install', event => {
	event.waitUntil(precache());
});

self.addEventListener('fetch', event => {
	const request = event.request;
	const url = event.request.url;
	if (url.includes("googleapis.com")) {
		event.respondWith(fetch(request));
	} else {
		event.respondWith(from_cache(request));
		event.waitUntil(update(request));
	}
});

function precache() {
	caches.open(CACHE).then(cache =>
		cache.addAll([
			`/app/`,
			`/app/js/main.js`,
			`/app/css/main.css`,
			`/app/css/field.css`,
			`/__/firebase/7.2.0/firebase-app.js`,
			`/__/firebase/7.2.0/firebase-auth.js`,
			`/__/firebase/init.js`
		]));
}

async function from_cache(request) {
	const cache = await caches.open(CACHE);
	const matching = await cache.match(request);
	return matching || Promise.reject("from_cache: No match found");
}

async function update(request) {
	const cache = await caches.open(CACHE);
	const response = await fetch(request);
	return cache.put(request, response);
}