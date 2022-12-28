import { entries, del } from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";

const cacheName = "static";

self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(cacheName).then( cache => {
            return cache.addAll([
                "/",
                "manifest.json",
                "index.html",
                "404.html",
                "photos.html",
                "fetch-photos.js",
                "photos",
                "/photos-array",
                "icons/apple-icon-180.png",
                "icons/manifest-icon-192.maskable.png",
                "https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css"
            ])
        })
    )
});

self.addEventListener("activate", e => {
    const cacheWhitelist = [cacheName];

    e.waitUntil(
        caches.keys().then( cacheNames => {
            return Promise.all(
                cacheNames.map( cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) 
                        return caches.delete(cacheName);
                })
            );
        })
    );
});


self.addEventListener("fetch", event => {
    event.respondWith(
        fetch(event.request)
        .then( async (response) => {
            if (response.status === 404) {
                return caches.match("404.html");
            }

            return caches.open(cacheName).then( cache => {
                if (!event.request.url.endsWith("notification")) 
                    cache.put(event.request, response.clone())
                return response;
            })
        })
        .catch(function() { 
            return caches.match(event.request)
            .then( res => {
                if (res !== undefined)
                    return res
                else
                    return caches.match("404.html");
            })
        })
    );
});

self.addEventListener("sync", e => {
    if (e.tag === "upload") {
        e.waitUntil(
            backgroundSync()
        );
    }
})

const backgroundSync = async function() {
    entries().then( entries => {
        entries.forEach( entry => 
        {
            fetch("/photo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "id": entry[1].id,
                    "photo": entry[1].photo
                })
            })
            .then( result => {
                result.json().then( jsonData => {
                    if (result.ok)
                        del(jsonData.id);
                    else
                        alert("Error while uploading...")
                })
            })
            .catch(error => {
                console.log(error);
            });
        })
    });
}

self.addEventListener("push", e => {
    const data = e.data.json();

    self.registration.showNotification(
        data.title,
        {
            body: "Click here to view",
            icon: "icons/apple-icon-180.png",
            badge: "icons/apple-icon-180.png",
            data: {
                redirectUrl: "/photos.html"
            }
        }
    )
});

self.addEventListener("notificationclick", function (event) {
    const notification = event.notification;

    event.waitUntil(
        clients.matchAll().then(cls => {
            cls.forEach( client => {
                client.navigate(notification.data.redirectUrl);
                client.focus();
            });
            notification.close();
        })
    );
});
