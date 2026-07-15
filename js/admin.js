console.log("ADMIN DASHBOARD LOADED");


let allQuotes = [];

let visitorChart = null;

let selectedQuote = null;





// =====================================================
// CHECK LOGIN
// =====================================================


async function checkAdmin(){


const {data}=

await supabaseClient.auth.getSession();



if(!data.session){

window.location.href="login.html";

}



}


checkAdmin();







// =====================================================
// LOAD QUOTES
// =====================================================


async function loadQuotes(){


const {data,error}=

await supabaseClient

.from("quote_requests")

.select("*")

.order(
"created_at",
{
ascending:false
}
);



if(error){

console.error(
"Quote loading error:",
error
);

return;

}



allQuotes=data;



updateCounters();


displayQuotes(allQuotes);



}








// =====================================================
// DISPLAY REQUEST LIST
// =====================================================


function displayQuotes(quotes){


const container =

document.getElementById("quotes");



container.innerHTML="";




if(quotes.length===0){


container.innerHTML=

`
<p>
No requests found.
</p>
`;

return;


}




quotes.forEach(quote=>{


container.innerHTML +=


`

<div class="quote-card"

onclick="openQuote('${quote.id}')">


<h3>

${quote.project_name}

</h3>


<p>

${quote.name}

</p>



<p>

${quote.project_type}

</p>



<span class="status-badge">

${quote.status}

</span>



</div>


`;



});



}








// =====================================================
// OPEN REQUEST DETAILS
// =====================================================


window.openQuote=function(id){



selectedQuote =

allQuotes.find(
q=>q.id==id
);



const panel=

document.getElementById(
"detailsPanel"
);



panel.innerHTML=


`

<div class="details-card">


<h2>

${selectedQuote.project_name}

</h2>




<p>

<b>Customer:</b>

${selectedQuote.name}

</p>



<p>

<b>Email:</b>

<a href="mailto:${selectedQuote.email}">

${selectedQuote.email}

</a>

</p>




<p>

<b>Project Type:</b>

${selectedQuote.project_type}

</p>




<h3>
Description
</h3>


<p>

${selectedQuote.details}

</p>





<h3>
Files
</h3>


<div>

${
selectedQuote.file_link

?

selectedQuote.file_link

.split("\n")

.map(file=>


`

<a

class="file-button"

href="${file}"

target="_blank">

📎 Open File

</a>


<br>


`

)

.join("")

:

"No files uploaded"

}


</div>







<h3>
Project Status
</h3>



<select

id="statusEditor"

class="status-select">


${createStatusOptions(selectedQuote.status)}


</select>





<div class="admin-actions">


<button

class="primary"

onclick="saveStatus()">

Save Status

</button>



<button

class="archive-button"

onclick="archiveQuote()">

Archive

</button>



</div>



</div>



`;



}








function createStatusOptions(current){


let statuses=[

"New",

"Reviewing",

"Quoted",

"Approved",

"Printing",

"Completed",

"Archived"

];


return statuses.map(status=>


`

<option

value="${status}"

${status===current?"selected":""}>

${status}

</option>


`

).join("");



}









// =====================================================
// SAVE STATUS
// =====================================================


window.saveStatus=async function(){



if(!selectedQuote){

return;

}



const status=

document.getElementById(
"statusEditor"
).value;





const {error}=

await supabaseClient

.from("quote_requests")

.update({

status:status,

updated_at:new Date()

})

.eq(

"id",

selectedQuote.id

);





if(error){


console.error(error);


alert(
"Could not save status."
);


return;


}




alert(
"Status updated!"
);



await loadQuotes();



openQuote(selectedQuote.id);



}









// =====================================================
// ARCHIVE REQUEST
// =====================================================


window.archiveQuote=async function(){



if(!selectedQuote){

return;

}



let confirmArchive=

confirm(

"Archive this project?"

);



if(!confirmArchive){

return;

}





const {error}=

await supabaseClient

.from("quote_requests")

.update({

status:"Archived",

updated_at:new Date()

})

.eq(

"id",

selectedQuote.id

);





if(error){

console.error(error);

alert(
"Could not archive."
);

return;

}





alert(
"Project archived."
);



document

.getElementById(
"detailsPanel"
)

.innerHTML=

`

<p>
Select a request to view details.
</p>

`;



loadQuotes();



}








// =====================================================
// COUNTERS
// =====================================================


function updateCounters(){



document.getElementById("newCount").textContent=

countStatus("New");



document.getElementById("reviewCount").textContent=

countStatus("Reviewing");



document.getElementById("quoteCount").textContent=

countStatus("Quoted");



document.getElementById("printingCount").textContent=

countStatus("Printing");



document.getElementById("completeCount").textContent=

countStatus("Completed");



document.getElementById("archiveCount").textContent=

countStatus("Archived");



}



function countStatus(status){


return allQuotes.filter(

quote=>quote.status===status

).length;


}









// =====================================================
// SEARCH
// =====================================================


document

.getElementById("searchQuotes")

.addEventListener(

"input",

function(){



let search=

this.value.toLowerCase();




let filtered=

allQuotes.filter(quote=>



quote.project_name

.toLowerCase()

.includes(search)



||

quote.name

.toLowerCase()

.includes(search)



||

quote.email

.toLowerCase()

.includes(search)



);



displayQuotes(filtered);



}

);









// =====================================================
// FILTER
// =====================================================


document

.getElementById("statusFilter")

.addEventListener(

"change",

function(){



let filter=this.value;



if(filter==="all"){


displayQuotes(allQuotes);


return;


}




displayQuotes(

allQuotes.filter(

quote=>

quote.status===filter

)

);



}

);









// =====================================================
// LOGOUT
// =====================================================


document

.getElementById("logoutButton")

.addEventListener(

"click",

async()=>{


await supabaseClient.auth.signOut();


window.location.href="login.html";


}

);









// =====================================================
// ANALYTICS
// =====================================================


async function loadAnalytics(){



const {data,error}=

await supabaseClient

.from("site_visits")

.select("created_at");





if(error){


console.error(
"Analytics error:",
error
);


return;


}




document.getElementById(

"totalVisitors"

)

.textContent=data.length;





let today=

new Date()

.toDateString();





document.getElementById(

"todayVisitors"

)

.textContent=


data.filter(v=>

new Date(
v.created_at
)

.toDateString()===today

).length;






let hours=

Array(24).fill(0);





data.forEach(v=>{


let hour=

new Date(

v.created_at

)

.getHours();



hours[hour]++;



});






if(visitorChart){

visitorChart.destroy();

}






visitorChart=

new Chart(

document.getElementById(

"visitorChart"

),

{


type:"bar",


data:{


labels:[

"12AM",
"1AM",
"2AM",
"3AM",
"4AM",
"5AM",
"6AM",
"7AM",
"8AM",
"9AM",
"10AM",
"11AM",
"12PM",
"1PM",
"2PM",
"3PM",
"4PM",
"5PM",
"6PM",
"7PM",
"8PM",
"9PM",
"10PM",
"11PM"

],


datasets:[{

label:"Visitors",

data:hours

}]


}



}

);



}








// =====================================================
// START
// =====================================================


loadQuotes();

loadAnalytics();