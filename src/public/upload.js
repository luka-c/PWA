import { set } from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";

const start = document.querySelector("#start");
const snap = document.querySelector("#snap");
const canvas = document.querySelector("#canvas");
const video = document.querySelector("#video");
const end = document.querySelector("#end");

const camera_options = {
    video: true,
    audio: false
}

if ("mediaDevices" in navigator) {
    start.addEventListener('click', async function() {
        const stream = await navigator
            .mediaDevices
            .getUserMedia(camera_options);
        video.srcObject = stream;
        document.getElementById("video-container").style.display = "flex"
    });

    snap.addEventListener('click', function() {
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        document.getElementById("canvas-container").style.display = "flex"
    });

    end.addEventListener('click', async function() {
        video.pause();
        video.srcObject = undefined;

        const stream = await navigator
            .mediaDevices
            .getUserMedia(camera_options);

        stream.getTracks().forEach( track => {
            track.stop();
        })
        
        document.getElementById("video-container").style.display = "none"
        document.getElementById("canvas-container").style.display = "none"
    });

}
else {
    alert("Your device or browser doesn't support media capture")
}

const upload = document.querySelector("#upload");

upload.addEventListener("click", e => {
    if ("serviceWorker" in navigator && "SyncManager" in window) {
        const image_url = canvas.toDataURL('image/jpeg');

        fetch(image_url).then(() => {
            return image_url.replace(/^data:image\/?[A-z]*;base64,/, "");
        })
        .then( data => {
            const id = crypto.randomUUID();
            set(id, { id: id, photo: data });
            return navigator.serviceWorker.ready;
        })
        .then( registration => {
            sendNotification(registration);
            return registration.sync.register("upload");
        })
        .then(() => {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        })
        .catch((error) => {
            console.log(error);
        });

    }
    else {
        alert("Your browser or device doesn't support background sync.");
}

})

const public_key = "BHtnEf9znbbttZUCwSm2mdEhhl9T8Wxc-WJofPcUBUzZrBSlLqhTjVC_ZnzSqoJ4h5ZGGc4Ovll1gq3Gy71vhZA";

async function sendNotification(registration) {
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(public_key)
    });

    await fetch("/notification", {
        method: "POST",
        headers: { "content-type" : "application/json" },
        body: JSON.stringify(
            subscription
        )
    })
}

function urlBase64ToUint8Array(base64String) {
    var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}