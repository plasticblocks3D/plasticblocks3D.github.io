document
.getElementById("projectForm")
.addEventListener("submit", async function(event){

    event.preventDefault();

    const button = this.querySelector("button");

    button.disabled = true;
    button.textContent = "Uploading...";


    const name = document.getElementById("projectCustomerName").value;
    const email = document.getElementById("projectCustomerEmail").value;
    const projectName = document.getElementById("projectName").value;
    const projectType = document.getElementById("projectType").value;
    const details = document.getElementById("projectDetails").value;


    const files = document.getElementById("projectFiles").files;


    let uploadedLinks = [];


    // Upload files
    for (const file of files) {

        const fileName =
            Date.now() + "-" + file.name;


        const { error: uploadError } =
        await supabaseClient
        .storage
        .from("quote-files")
        .upload(fileName, file);


        if(uploadError){

            console.error(uploadError);

            alert("File upload failed.");

            button.disabled = false;
            button.textContent = "Request Quote";

            return;
        }


        const { data } =
        supabaseClient
        .storage
        .from("quote-files")
        .getPublicUrl(fileName);


        uploadedLinks.push(data.publicUrl);

    }



    const fileLinks =
        uploadedLinks.join("\n");



    button.textContent = "Sending...";



    const { error } = await supabaseClient
    .from("quote_requests")
    .insert([
        {
            name:name,
            email:email,
            project_type:projectType,
            project_name:projectName,
            details:details,
            file_link:fileLinks
        }
    ]);



    if(error){

        console.error(error);

        alert(
        "Something went wrong. Please try again."
        );

    }

    else{

        alert(
        "Your project request has been sent!"
        );

        this.reset();

    }



    button.disabled = false;
    button.textContent = "Request Quote";


});