async function checkAdmin(){

const {data} =
await supabaseClient.auth.getSession();


if(!data.session){

window.location.href="login.html";

}

}


checkAdmin();



let quotes = [];





async function loadQuotes(){


const {data,error} = await supabaseClient

.from("quote_requests")

.select("*")

.order("created_at",{ascending:false});



if(error){

console.error(error);

return;

}



quotes=data;


updateCounts();


displayQuotes(quotes);


}





function updateCounts(){


document.getElementById("newCount").textContent =
quotes.filter(q=>q.status==="New").length;


document.getElementById("reviewCount").textContent =
quotes.filter(q=>q.status==="Reviewing").length;


document.getElementById("quoteCount").textContent =
quotes.filter(q=>q.status==="Quoted").length;


document.getElementById("printingCount").textContent =
quotes.filter(q=>q.status==="Printing").length;


document.getElementById("completeCount").textContent =
quotes.filter(q=>q.status==="Completed").length;


document.getElementById("archiveCount").textContent =
quotes.filter(q=>q.status==="Archived").length;


}






function displayQuotes(list){


const container =
document.getElementById("quotes");


container.innerHTML="";



if(list.length===0){

container.innerHTML="<p>No projects found.</p>";

return;

}



list.forEach(quote=>{


container.innerHTML += `


<div class="mini-card" onclick="showDetails(${quote.id})">


<h3>
${quote.project_name || "Untitled Project"}
</h3>


<p>
${quote.name}
</p>


<span class="status-badge">
${quote.status}
</span>


</div>


`;


});


}







function showDetails(id){


const quote =
quotes.find(q=>q.id===id);



document.getElementById("detailsPanel").innerHTML = `


<div class="details-box">


<h2>
${quote.project_name}
</h2>



<p>
<b>Customer:</b>
${quote.name}
</p>


<p>

<b>Email:</b>

<a href="mailto:${quote.email}">
${quote.email}
</a>

</p>



<p>

<b>Project Type:</b>

${quote.project_type}

</p>



<p>

<b>Description:</b>

</p>


<p>

${quote.details}

</p>





<p>

<b>Status:</b>


<select class="status-select"
data-id="${quote.id}">


${[
"New",
"Reviewing",
"Quoted",
"Approved",
"Printing",
"Completed",
"Archived"

]
.map(status=>`

<option ${quote.status===status?"selected":""}>

${status}

</option>

`)
.join("")}


</select>


</p>





<h3>
Files
</h3>


${
quote.file_link

?

quote.file_link
.split("\n")
.map(file=>`

<a class="file-button"
href="${file}"
target="_blank">

📎 Open File

</a><br>

`)
.join("")

:

"No files uploaded"

}





<button onclick="closeDetails()">

Close

</button>



</div>


`;



}







function closeDetails(){

document.getElementById("detailsPanel").innerHTML="";

}








document.addEventListener("change", async function(event){



if(event.target.classList.contains("status-select")){


const id =
event.target.dataset.id;


const status =
event.target.value;



await supabaseClient

.from("quote_requests")

.update({

status:status

})

.eq("id",id);



loadQuotes();


}


});









document

.getElementById("searchQuotes")

.addEventListener("input",function(){


const search =
this.value.toLowerCase();



displayQuotes(

quotes.filter(q=>

JSON.stringify(q)

.toLowerCase()

.includes(search)

)

);


});







document

.getElementById("statusFilter")

.addEventListener("change",function(){



if(this.value==="all"){

displayQuotes(quotes);

return;

}



displayQuotes(

quotes.filter(q=>

q.status===this.value

)

);


});







document

.getElementById("logoutButton")

.addEventListener("click",async()=>{


await supabaseClient.auth.signOut();


window.location.href="login.html";


});






loadQuotes();