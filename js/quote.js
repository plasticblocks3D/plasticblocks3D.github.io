document
.getElementById("projectForm")
.addEventListener("submit", async function(event){

    event.preventDefault();

    const button = this.querySelector("button");

    button.disabled = true;
    button.textContent = "Sending...";


    // Get form values
    const name = this.querySelector('[name="name"]').value;
    const email = this.querySelector('[name="email"]').value;
    const projectName = this.querySelector('[name="project_name"]').value;
    const projectType = this.querySelector('[name="project_type"]').value;
    const details = this.querySelector('[name="details"]').value;
    const fileLink = this.querySelector('[name="file_link"]').value;


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