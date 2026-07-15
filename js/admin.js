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
${quote.status}
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