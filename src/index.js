const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require("body-parser");
const webpush = require('web-push');
const fs = require("fs");

dotenv.config();

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 8080;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

//GET routes
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/photos", function (req, res) {
    res.sendFile(path.join(__dirname, "public", "photos.html"));
});

app.get("/photos-array", function (req, res) {
    const photos = fs.readdirSync(path.join(__dirname, "public", "photos"));
    res.json({ photos });
});

//WEBPUSH
const public_key = "BHtnEf9znbbttZUCwSm2mdEhhl9T8Wxc-WJofPcUBUzZrBSlLqhTjVC_ZnzSqoJ4h5ZGGc4Ovll1gq3Gy71vhZA";
const private_key = "O-UTxMACzPEH5pCz5EK6JrTj1uqyZ0wEFcuvbzYSHNU"

webpush.setVapidDetails("mailto:test@test.com", public_key, private_key);


//POST routes
app.post("/photo", async function (req, res) {
    const name = req.body.id;
    const upload_path = path.join(__dirname, `public/photos/${name}.jpeg`);

    //This is a base64 string
    const photo = req.body.photo;

    fs.writeFile(upload_path, photo, { encoding: 'base64' }, function(err) {
        console.log(err);
    });

    res.json({ id: name });
});

app.post("/notification", function (req, res) {
    const subscription = req.body;
    res.status(201).json({});

    const data = JSON.stringify({
        "title": "A new photo was uploaded"
    })

    webpush.sendNotification(subscription, data)
    .catch(error => {
        console.log(error);
    })
});


if (externalUrl) {
    const hostname = '127.0.0.1';
    app.listen(port, hostname, () => {
        console.log(`Server locally running at http://${hostname}:${port}/ and from outside on ${externalUrl}`);
    });
}
else {
    app.listen(port, () => {
        console.log(`Server locally running at http://localhost:${port}/`);
    });
}