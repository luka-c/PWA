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
        fetch(image_url).then((res) => {
            return res.blob();
        })
        .then( data => {
            const id = crypto.randomUUID();
            set(id, { id: id, photo: data });
            return navigator.serviceWorker.ready;
        })
        .then( registration => {
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