async function checkAdmin(){


const {data} = await supabaseClient.auth.getSession();


if(!data.session){

window.location.href="login.html";

}


}


checkAdmin();



console.log("ADMIN JS LOADED");



let allQuotes = [];





// =============================
// LOAD QUOTE REQUESTS
// =============================


async function loadQuotes(){


const {data,error} = await supabaseClient

.from("quote_requests")

.select("*")

.order("created_at",{ascending:false});



if(error){

console.error(error);

return;

}



allQuotes=data;


updateCounters();


displayQuotes(allQuotes);



}





// =============================
// DISPLAY REQUEST CARDS
// =============================


function displayQuotes(quotes){



const container=document.getElementById("quotes");


container.innerHTML="";



if(quotes.length===0){

container.innerHTML="<p>No requests found.</p>";

return;

}



quotes.forEach(quote=>{



container.innerHTML += `


<div class="quote-card" data-id="${quote.id}">


<h3>

${quote.project_name}

</h3>


<p>

<b>${quote.name}</b>

</p>


<p>

${quote.project_type}

</p>



<p>

Status:

<select class="status-select" data-id="${quote.id}">


${createOption("New",quote.status)}

${createOption("Reviewing",quote.status)}

${createOption("Quoted",quote.status)}

${createOption("Approved",quote.status)}

${createOption("Printing",quote.status)}

${createOption("Completed",quote.status)}

${createOption("Archived",quote.status)}


</select>


</p>



<button class="view-button">

View Details

</button>



</div>



`;



});



}





function createOption(value,current){


return `

<option ${value===current?"selected":""}>

${value}

</option>

`;



}





// =============================
// DETAILS PANEL
// =============================


document.addEventListener("click",function(event){



if(event.target.classList.contains("view-button")){


const card =
event.target.closest(".quote-card");


const id =
card.dataset.id;



const quote =
allQuotes.find(q=>q.id==id);



showDetails(quote);



}



});





function showDetails(quote){



const panel =
document.getElementById("detailsPanel");



panel.innerHTML=`


<div class="details-card">


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
<b>Description:</b>
</p>

<p>
${quote.details}
</p>



<p>
<b>Files:</b>
</p>


${

quote.file_link

?

quote.file_link
.split("\n")
.map(file=>`

<a href="${file}" target="_blank">

Open File

</a><br>

`)
.join("")

:

"No files"

}



<br>


<button 
class="archive-button"
data-id="${quote.id}">

Archive Request

</button>



</div>



`;



}








// =============================
// UPDATE STATUS
// =============================


document.addEventListener("change",async function(event){



if(event.target.classList.contains("status-select")){


const id =
event.target.dataset.id;


const status =
event.target.value;



const {error}=await supabaseClient

.from("quote_requests")

.update({

status:status

})

.eq("id",id);



if(error){

console.error(error);

alert("Update failed");

}

else{

console.log("Status updated");

loadQuotes();

}



}



});








// =============================
// ARCHIVE
// =============================


document.addEventListener("click",async function(event){



if(event.target.classList.contains("archive-button")){


const id =
event.target.dataset.id;



const {error}=await supabaseClient

.from("quote_requests")

.update({

status:"Archived"

})

.eq("id",id);



if(error){

console.error(error);

}

else{

loadQuotes();

}



}



});









// =============================
// COUNTERS
// =============================


function updateCounters(){



document.getElementById("newCount").textContent =
countStatus("New");


document.getElementById("reviewCount").textContent =
countStatus("Reviewing");


document.getElementById("quoteCount").textContent =
countStatus("Quoted");


document.getElementById("printingCount").textContent =
countStatus("Printing");


document.getElementById("completeCount").textContent =
countStatus("Completed");


document.getElementById("archiveCount").textContent =
countStatus("Archived");


}



function countStatus(status){


return allQuotes.filter(q=>q.status===status).length;


}








// =============================
// SEARCH + FILTER
// =============================


document
.getElementById("searchQuotes")
.addEventListener("input",filterQuotes);



document
.getElementById("statusFilter")
.addEventListener("change",filterQuotes);





function filterQuotes(){



const search =
document.getElementById("searchQuotes")
.value
.toLowerCase();



const filter =
document.getElementById("statusFilter")
.value;



let results =
allQuotes.filter(q=>{



let matchesSearch =

q.project_name.toLowerCase().includes(search)

||

q.name.toLowerCase().includes(search);



let matchesStatus =

filter==="all"

||

q.status===filter;



return matchesSearch && matchesStatus;



});



displayQuotes(results);



}








// =============================
// VISITOR ANALYTICS
// =============================


async function loadAnalytics(){



const {data,error}=await supabaseClient

.from("site_visits")

.select("*");



if(error){

console.error(error);

return;

}



document.getElementById("totalViews")
.textContent=data.length;



const visitors =
[...new Set(data.map(v=>v.visitor_id))];


document.getElementById("totalVisitors")
.textContent=
visitors.length;




const today =
new Date()
.toISOString()
.split("T")[0];



const todayVisits =
data.filter(v=>v.date===today);



document.getElementById("todayVisitors")
.textContent=
todayVisits.length;




let hours = Array(24).fill(0);



data.forEach(v=>{

hours[v.hour]++;

});




new Chart(

document.getElementById("visitorChart"),

{

type:"bar",

data:{

labels:

hours.map((x,i)=>i+":00"),


datasets:[{

label:"Visitors",

data:hours

}]

}

}

);



}







// =============================
// LOGOUT
// =============================


document

.getElementById("logoutButton")

.addEventListener("click",async()=>{


await supabaseClient.auth.signOut();


window.location.href="login.html";


});








loadQuotes();

loadAnalytics();