async function checkAdmin(){

    const { data } = await supabaseClient.auth.getSession();


    if(!data.session){

        window.location.href = "login.html";

    }

}

checkAdmin();

console.log("ADMIN JS LOADED");

async function loadQuotes(){

const { data, error } = await supabaseClient
.from("quote_requests")
.select("*")
.order("created_at", {ascending:false});


console.log("QUOTE DATA:", data);
console.log("QUOTE ERROR:", error);


if(error){

console.error(error);

return;

}


const container =
document.getElementById("quotes");


container.innerHTML="";


data.forEach(quote=>{


container.innerHTML += `

<div class="quote-card">

<h2>
${quote.project_name}
</h2>

<p>
<b>Customer:</b>
${quote.name}
</p>

<p>
<b>Email:</b>
${quote.email}
</p>


<p>
<b>Type:</b>
${quote.project_type}
</p>


<p>
${quote.details}
</p>


<p>
<b>Status:</b>

<select 
class="status-select"
data-id="${quote.id}">

<option ${quote.status === "New" ? "selected" : ""}>
New
</option>

<option ${quote.status === "Reviewing" ? "selected" : ""}>
Reviewing
</option>

<option ${quote.status === "Quoted" ? "selected" : ""}>
Quoted
</option>

<option ${quote.status === "Approved" ? "selected" : ""}>
Approved
</option>

<option ${quote.status === "Printing" ? "selected" : ""}>
Printing
</option>

<option ${quote.status === "Completed" ? "selected" : ""}>
Completed
</option>

<option ${quote.status === "Archived" ? "selected" : ""}>
Archived
</option>

</select>

</p>


</div>

`;


});


}


loadQuotes();

document
.getElementById("logoutButton")
.addEventListener("click", async ()=>{


await supabaseClient.auth.signOut();


window.location.href="login.html";


});

document
.getElementById("logoutButton")
.addEventListener("click", async ()=>{

    await supabaseClient.auth.signOut();

    window.location.href = "login.html";

});

document
.addEventListener("change", async function(event){


if(event.target.classList.contains("status-select")){


const id = event.target.dataset.id;

const newStatus = event.target.value;



const { data, error } = await supabaseClient

.from("quote_requests")

.update({
    status: newStatus
})

.eq("id", id)
.select();


console.log("UPDATED ROW:", data);
console.log("UPDATE ERROR:", error);



if(error){

console.error(error);

alert("Could not update status");

}

else{

console.log("Status updated");

}


}


});