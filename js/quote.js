document
.getElementById("projectForm")
.addEventListener("submit", async function(event){

    event.preventDefault();

    const button = this.querySelector("button");

    button.disabled = true;
    button.textContent = "Sending...";


    const { data, error } = await supabaseClient
    .from("quote_requests")
    .insert([
        {
            name: document.getElementById("projectCustomerName").value,
            email: document.getElementById("projectCustomerEmail").value,
            project_type: document.getElementById("projectType").value,
            project_name: document.getElementById("projectName").value,
            details: document.getElementById("projectDetails").value,
            file_link: document.getElementById("fileLink").value
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