"use strict";

importScripts('/app/js/cache-polyfill.js');


const version = "0.0.9";
const cacheName = `Runyonii-${version}`;
self.addEventListener('install', e => {
  const timeStamp = Date.now();
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        `/app/`,
        `/app/js/main.js`,
        `/app/css/main.css`,
        `/app/css/field.css`,
        `/images/apple-touch-icon.png`,
        `/images/favicon-32x32.png`,
        `/images/favicon-16x16.png`,
        `/config/site.webmanifest`,
        `/images/safari-pinned-tab.svg`,
        `https://fonts.googleapis.com/css?family=Cabin:400,500&subset=latin-ext`,
        `https://fonts.googleapis.com/icon?family=Material+Icons`,
        `https://fonts.gstatic.com/s/cabin/v12/u-4x0qWljRw-Pd8w__1ImSRu.woff2`,
        `https://fonts.gstatic.com/s/materialicons/v36/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2`,
        `/__/firebase/6.3.5/firebase-app.js`,
        `/__/firebase/6.3.5/firebase-auth.js`,
        `/__/firebase/init.js`
      ])
      .then(() => {
        console.log("Cached a bunch of files");
      })
      .catch((e) => console.log(e))
    })
    .catch((e) => console.log(e))
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch((e) => console.log(e))
  );
});