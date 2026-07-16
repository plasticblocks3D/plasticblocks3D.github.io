console.log("QUOTE JS LOADED");


const form = document.getElementById("projectForm");


form.addEventListener("submit", async function(event){

    event.preventDefault();


    const button = this.querySelector("button");


    button.disabled = true;
    button.innerHTML = "Preparing request...";



    const name = 
    document.getElementById("projectCustomerName")
    .value.trim();


    const email =
    document.getElementById("projectCustomerEmail")
    .value.trim();


    const projectName =
    document.getElementById("projectName")
    .value.trim();


    const projectType =
    document.getElementById("projectType")
    .value;


    const details =
    document.getElementById("projectDetails")
    .value.trim();


    const fileInput =
    document.getElementById("projectFiles");


    const files =
    Array.from(fileInput.files || []);



    let uploadedFiles = [];



    // ===============================
    // UPLOAD FILES
    // ===============================


    try{


        if(files.length > 0){


            for(let i = 0; i < files.length; i++){


                const file = files[i];


                button.innerHTML =
                `Uploading ${i + 1}/${files.length}...`;



                const cleanName =
                file.name.replace(
                    /[^a-zA-Z0-9._-]/g,
                    "_"
                );



                const path =
                `${crypto.randomUUID()}-${cleanName}`;



                const {error:uploadError} =

                await supabaseClient

                .storage

                .from("quote-files")

                .upload(
                    path,
                    file,
                    {
                        cacheControl:"3600",
                        upsert:false
                    }
                );



                if(uploadError){

                    console.error(
                        "Upload error:",
                        uploadError
                    );

                    throw uploadError;

                }



                const {data:urlData} =

                supabaseClient

                .storage

                .from("quote-files")

                .getPublicUrl(path);



                uploadedFiles.push({

                    name:file.name,

                    url:urlData.publicUrl

                });



            }


        }


    }


    catch(error){


        console.error(
            "UPLOAD FAILED:",
            error
        );


        alert(
            "File upload failed. Check Supabase Storage permissions."
        );


        button.disabled=false;

        button.innerHTML =
        "Request Quote";


        return;


    }




    // ===============================
    // PREPARE FILE LIST
    // ===============================


    const fileText =

    uploadedFiles.length > 0

    ?

    uploadedFiles
    .map(file =>
        `${file.name}: ${file.url}`
    )
    .join("\n")


    :

    "No files uploaded";






    console.log(
        "Submitting quote:",
        {

            name:name,

            email:email,

            projectName:projectName,

            projectType:projectType,

            details:details,

            files:uploadedFiles

        }
    );





    // ===============================
    // SAVE REQUEST
    // ===============================


    button.innerHTML =
    "Sending request...";



    const {

        data,

        error

    } = await supabaseClient


    .from("quote_requests")


    .insert([

        {

            name:name,

            email:email,

            project_name:projectName,

            project_type:projectType,

            details:details,

            file_link:fileText,

            status:"New"

        }

    ])

    .select();






    console.log(

        "Database response:",

        {

            data:data,

            error:error

        }

    );






    if(error){


        console.error(
            "DATABASE ERROR:",
            error
        );


        alert(
            "Could not submit request."
        );


        button.disabled=false;

        button.innerHTML =
        "Request Quote";


        return;


    }





    alert(
        uploadedFiles.length > 0

        ?

        `Your request was sent with ${uploadedFiles.length} uploaded file(s)!`

        :

        "Your request was sent!"

    );





    window.location.href =
    "../thank-you.html";



});