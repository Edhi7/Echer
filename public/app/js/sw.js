"use strict";

importScripts('js/cache-polyfill.js');


const version = "0.0.6";
const cacheName = `Echer-${version}`;
self.addEventListener('install', e => {
  const timeStamp = Date.now();
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        `../app/?time=${timeStamp}`,
        `../?time=${timeStamp}`,
        `../app/js/main.js?time=${timeStamp}`,
        `../app/css/main.css?time=${timeStamp}`,
        `../app/css/field.css?time=${timeStamp}`,
        `../images/white_logo.svg?time=${timeStamp}`,
        `../images/apple-touch-icon.png?time=${timeStamp}`,
        `../images/favicon-32x32.png?time=${timeStamp}`,
        `../images/favicon-16x16.png?time=${timeStamp}`,
        `../config/site.webmanifest?time=${timeStamp}`,
        `../images/safari-pinned-tab.svg?time=${timeStamp}`,
        `https://fonts.googleapis.com/css?family=Cabin:400,500&subset=latin-ext`,
        `https://fonts.googleapis.com/icon?family=Material+Icons`,
        `https://fonts.gstatic.com/s/cabin/v12/u-4x0qWljRw-Pd8w__1ImSRu.woff2`,
        `https://fonts.gstatic.com/s/materialicons/v36/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2`,
        `/__/firebase/4.12.1/firebase-app.js`,
        `/__/firebase/4.12.1/firebase-auth.js`,
        `/__/firebase/init.js`
      ])
        .then(() => self.skipWaiting());
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.open(cacheName)
      .then(cache => cache.match(event.request, { ignoreSearch: true }))
      .then(response => {
        return response || fetch(event.request);
      })
  );
});