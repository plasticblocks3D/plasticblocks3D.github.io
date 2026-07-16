console.log("QUOTE JS LOADED");


const form = document.getElementById("projectForm");


if (!form) {

    console.error("projectForm not found");

} else {


form.addEventListener("submit", async function(event) {


event.preventDefault();


const button = form.querySelector("button");


button.disabled = true;
button.innerHTML = "Processing...";



try {



    // ===============================
    // GET FORM VALUES
    // ===============================


    const name =
        document.getElementById("projectCustomerName")
        .value
        .trim();


    const email =
        document.getElementById("projectCustomerEmail")
        .value
        .trim();


    const projectName =
        document.getElementById("projectName")
        .value
        .trim();


    const projectType =
        document.getElementById("projectType")
        .value;


    const details =
        document.getElementById("projectDetails")
        .value
        .trim();


    const fileInput =
        document.getElementById("projectFiles");


    const files =
        fileInput ? Array.from(fileInput.files) : [];



    console.log("Files:", files);



    // ===============================
    // UPLOAD FILES
    // ===============================


    let fileLinks = [];



    for (let i = 0; i < files.length; i++) {


        const file = files[i];


        button.innerHTML =
        `Uploading file ${i + 1}/${files.length}...`;



        const cleanName =
            file.name.replace(
                /[^a-zA-Z0-9.-]/g,
                "_"
            );



        const filePath =
            crypto.randomUUID()
            + "-"
            + cleanName;



        console.log(
            "Uploading:",
            filePath
        );



        const upload =
            await supabaseClient
            .storage
            .from("quote-files")
            .upload(
                filePath,
                file,
                {
                    cacheControl:"3600",
                    upsert:false
                }
            );



        console.log(
            "Upload result:",
            upload
        );



        if (upload.error) {

            throw upload.error;

        }



        const publicURL =
            supabaseClient
            .storage
            .from("quote-files")
            .getPublicUrl(filePath)
            .data
            .publicUrl;



        console.log(
            "File URL:",
            publicURL
        );



        fileLinks.push(publicURL);



    }





    // ===============================
    // SAVE QUOTE REQUEST
    // ===============================


    button.innerHTML =
    "Sending request...";



    const databaseResult =
        await supabaseClient
        .from("quote_requests")
        .insert([

            {

            name:name,

            email:email,

            project_name:projectName,

            project_type:projectType,

            details:details,

            file_link:
                fileLinks.join("\n"),

            status:"New"

            }

        ]);



    console.log(
        "Database result:",
        databaseResult
    );



    if(databaseResult.error){


        throw databaseResult.error;

    }





    alert(
        "Your project request was sent!"
    );



    window.location.href =
        "../thank-you.html";




}

catch(error){


    console.error(
        "FINAL ERROR:",
        error
    );


    alert(
        "ERROR:\n\n"
        +
        error.message
    );



    button.disabled=false;

    button.innerHTML =
    "Request Quote";


}


});


}