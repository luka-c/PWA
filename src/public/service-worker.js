import { entries, del } from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";

const cacheName = "static";

self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(cacheName).then( cache => {
            return cache.addAll([
                "/",
                "manifest.json",
                "index.html",
                "photos.html",
                "404.html",
                "icons/apple-icon-180.png",
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


self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then( response => {
            if (response) {
                return response;
            }
            else {
                return fetch(e.request).then( response => {
                    if (response.status === 404) {
                        return caches.match("404.html");
                    }

                    return caches.open(cacheName).then( cache => {
                        cache.put(e.request.url, response.clone());
                        return response;
                    });
                });
            }
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
            console.log("Here");
            fetch("/photo", {
                method: "POST",
                body: {
                    "id": entry[1].id,
                    "photo": entry[1].photo
                }
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