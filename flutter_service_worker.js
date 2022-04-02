'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "6bfcb9546c38630f8337ffba09304e83",
"assets/assets/fonts/Ultima.ttf": "efdb72365839f99b209d4814429b728c",
"assets/assets/images/Bad_looking_snake.jpg": "12a9fba5c0eef5b88a622d71b253404d",
"assets/assets/images/body_down.png": "5022d0ff22ae77dd884e2932e8697330",
"assets/assets/images/body_left.png": "aa09ccf32dd5e93aabad1f4e84afcd3f",
"assets/assets/images/body_right.png": "877bb544882dae0ab5d0b56a3684fd66",
"assets/assets/images/body_top.png": "012065a493e7eb1366585fdc9d1d1563",
"assets/assets/images/b_DownRight.png": "06e0bd70cb8086762ecc5368137c47de",
"assets/assets/images/b_LeftDown.png": "b959994f1b61e4b1bd262fe440ac825e",
"assets/assets/images/b_LeftTop.png": "c42f0db6eedd870432766b5610091e78",
"assets/assets/images/b_TopRight.png": "1ecc8c8379b1ce4487b488b4c3413f51",
"assets/assets/images/game_over.png": "f9eafe4bc19edce39d452f9ba637b5f0",
"assets/assets/images/heart2.png": "202e683176690245eeb0efdfd294a996",
"assets/assets/images/snake_head_down.png": "45e5d1e0ba86a215a47f88a86aea9c90",
"assets/assets/images/snake_head_left.png": "99037d76a70dc0b15184a1712a0b773a",
"assets/assets/images/snake_head_right.png": "8442c35994fbf73f8f864f1f663403bc",
"assets/assets/images/snake_head_top.png": "a8b9d777accde6a0ae75ee0a0ea55fdc",
"assets/assets/images/snake_s_down.png": "efdd14e0c8f9bafffeac5629b44a5bef",
"assets/assets/images/snake_s_left.png": "c1f863d7ab8dd6ef9a8c7c6d95ee2049",
"assets/assets/images/snake_s_right.png": "ebe3319afb5b3eee93468557664409c8",
"assets/assets/images/snake_s_top.png": "4de86dc1e80d5aa35bc3748c8f82c21c",
"assets/assets/images/Unbenannt-2.png": "c1a7305b0420a3390370fe41ae70c5f5",
"assets/assets/images/X2.json": "7f1952f6b6105eb6fc044d9dcb411404",
"assets/assets/images/X2_text.json": "79d13cb6647a17f00bca24276f22b44b",
"assets/assets/music/music.mp3": "8e551d984af2462bb319e7a7fc12885b",
"assets/FontManifest.json": "2815e2a9facf5cfb99b41dd25d39bd46",
"assets/fonts/MaterialIcons-Regular.otf": "7e7a6cccddf6d7b20012a548461d5d81",
"assets/NOTICES": "493e9e30c5dad5e0d611f4871087ba3b",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "64cb6e05ba43ae4a0c47f0e0e1602df5",
"/": "64cb6e05ba43ae4a0c47f0e0e1602df5",
"main.dart.js": "2769bc4c815b76d4a8e9a8743d29e513",
"manifest.json": "15dee136be177e7474a70cc77283d9e6",
"version.json": "85e6c79e9fd8f8c160386def55276687"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
