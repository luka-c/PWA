const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const fs = require("fs");

dotenv.config();

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

//GET routes
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/photos", function (req, res) {
    res.sendFile(path.join(__dirname, "public", "photos.html"));
});

//POST routes
app.post("/photo", async function (req, res) {
    //const name = req.body.id;
    //const photo = req.body.photo;
    //const upload_path = path.join(__dirname, `public/photos/${name}.jpeg`);

    console.log("Body");
    console.log(req.body);
    //let buffer = await photo.arrayBuffer();

    // fs.writeFile(upload_path, buffer, {}, function(err) {
    //     console.log(err);
    // });

    res.json({ id: name });
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