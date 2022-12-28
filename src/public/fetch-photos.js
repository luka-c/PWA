fetch("/photos-array")
.then( response => {
    if (!response.ok) throw new Error("Couldn't fetch photos...");

    response.json()
    .then( data => 
    {
        const container = document.querySelector("#images");

        data.photos.forEach( photo => {
            let image = document.createElement('img');
            image.src = `./photos/${ photo }`;
            image.style.width = "90%";
            image.style.height = "90%";
            image.style.aspectRatio = "600/400";
            image.style.marginBottom = "2rem";

            container.appendChild(image)
        });
    });
    
})
.catch( error => {
    console.log(error);
});
