document
.getElementById("projectForm")
.addEventListener("submit", async function(event){

    event.preventDefault();

    const button = this.querySelector("button");

    button.disabled = true;
    button.textContent = "Sending...";


    const name = document.getElementById("projectCustomerName").value;
    const email = document.getElementById("projectCustomerEmail").value;
    const projectName = document.getElementById("projectName").value;
    const projectType = document.getElementById("projectType").value;
    const details = document.getElementById("projectDetails").value;
    const fileLink = document.getElementById("fileLink").value;


    const { data, error } = await supabaseClient
        .from("quote_requests")
        .insert([
            {
                name: name,
                email: email,
                project_type: projectType,
                project_name: projectName,
                details: details,
                file_link: fileLink
            }
        ]);


    if(error){

        console.error(error);

        alert("Something went wrong. Please try again.");

        button.disabled = false;
        button.textContent = "Request Quote";

    }
    else{

        alert("Your project request has been sent!");

        this.reset();

        button.disabled = false;
        button.textContent = "Request Quote";

    }

});