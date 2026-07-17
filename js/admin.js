requireAdminLogin();

console.log("ADMIN DASHBOARD LOADED");


let allQuotes = [];

let selectedQuote = null;

let visitorChart = null;



document.addEventListener(
"DOMContentLoaded",
async()=>{


if(!await checkAdmin()){
return;
}


setupButtons();

setupSearch();

setupFilter();

setupStatusCards();


await loadQuotes();

await loadAnalytics();


});





// =============================
// LOGIN CHECK
// =============================


async function checkAdmin(){


const {data,error}=

await supabaseClient.auth.getSession();



if(error){

console.error(error);

return false;

}



if(!data.session){

window.location.href="login.html";

return false;

}



return true;


}






// =============================
// BUTTONS
// =============================


function setupButtons(){


const logout =
document.getElementById("logoutButton");



if(logout){

logout.onclick=async()=>{


await supabaseClient.auth.signOut();


window.location.href="login.html";


};


}





const refresh =
document.getElementById("refreshButton");



if(refresh){

refresh.onclick=async()=>{


await loadQuotes();

await loadAnalytics();


};


}


}









// =============================
// LOAD QUOTES
// =============================


async function loadQuotes(){



const {

data,

error

}=

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

console.error(error);

return;

}



allQuotes=data || [];


updateCounters();


displayQuotes(allQuotes);



}









// =============================
// DISPLAY LIST
// =============================


function displayQuotes(quotes){


const box =
document.getElementById("quotes");



box.innerHTML="";




if(quotes.length===0){

box.innerHTML=

`
<p>No requests found.</p>
`;

return;

}




quotes.forEach(q=>{


box.innerHTML +=

`

<div class="quote-card"

onclick="openQuote('${q.id}')">


<h3>
${q.project_name || "Unnamed Project"}
</h3>


<p>
${q.name || "Unknown"}
</p>


<p>
${q.project_type || ""}
</p>


<span class="status-badge">

${q.status || "New"}

</span>


</div>

`;



});


}









// =============================
// OPEN DETAILS
// =============================


window.openQuote=function(id){



selectedQuote=

allQuotes.find(
q=>q.id==id
);



if(!selectedQuote)
return;





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


<div class="quote-id-box">


<p>

<b>Tracking Number:</b>

</p>


<span id="adminQuoteID">

${selectedQuote.quote_id || "No ID"}

</span>


<br><br>


<button

class="primary"

onclick="copyQuoteID()">

Copy ID

</button>


</div>



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

<b>Submitted:</b>

${new Date(
selectedQuote.created_at
)
.toLocaleString()}

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







<h3>
Quote Information
</h3>


<label>
Estimated Price
</label>


<input

id="priceEditor"

type="number"

value="${selectedQuote.price || ""}"

placeholder="Example: 75"

>





<label>
Internal Notes
</label>


<textarea

id="notesEditor"

rows="5"

placeholder="Customer details, material, ideas..."

>

${selectedQuote.notes || ""}

</textarea>







<h3>
Status
</h3>



<select id="statusEditor">


${statusOptions(selectedQuote.status)}


</select>





<br><br>



<button

class="primary"

onclick="saveQuote()">

Save Changes

</button>



<button

class="archive-button"

onclick="archiveQuote()">

Archive

</button>



</div>


`;



}









function statusOptions(current){

    let list=[

    "New",

    "Reviewing",

    "Designing",

    "Printing",

    "Quality Check",

    "Completed",

    "Archived"

    ];


    return list.map(s=>


    `

    <option

    value="${s}"

    ${s===current?"selected":""}>

    ${s}

    </option>


    `

    ).join("");

}





// =============================
// SAVE EVERYTHING
// =============================


window.saveQuote=async()=>{


if(!selectedQuote)
return;



const newStatus =

document.getElementById(
"statusEditor"
).value;



const oldStatus =

selectedQuote.status;





let update={


status:newStatus,


price:
document.getElementById(
"priceEditor"
).value,


notes:
document.getElementById(
"notesEditor"
).value,


updated_at:
new Date()


};






// =============================
// SAVE QUOTE CHANGES
// =============================


const {error}=

await supabaseClient

.from("quote_requests")

.update(update)

.eq(
"id",
selectedQuote.id
);





if(error){

console.error(error);

alert(
"Could not save changes."
);

return;

}








// =============================
// SAVE STATUS HISTORY
// =============================


if(oldStatus !== newStatus){



const {

error:historyError

}=


await supabaseClient

.from("quote_history")

.insert([{


quote_id:

selectedQuote.quote_id,


old_status:

oldStatus,


new_status:

newStatus


}]);




if(historyError){

console.error(
"History error:",
historyError
);


}






}






alert(
"Saved!"
);



await loadQuotes();


openQuote(selectedQuote.id);



}





// =============================
// ARCHIVE
// =============================


window.archiveQuote=async()=>{


if(!selectedQuote)
return;



const {

error

}=

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

return;

}






await supabaseClient

.from("quote_history")

.insert([{


quote_id:

selectedQuote.quote_id,


old_status:

selectedQuote.status,


new_status:

"Archived"


}]);







await loadQuotes();



document.getElementById(
"detailsPanel"
).innerHTML=

`
<p>Select a request.</p>
`;



};






// =============================
// COUNTERS
// =============================


function updateCounters(){



let ids={

New:"newCount",

Reviewing:"reviewCount",

Designing:"designCount",

Printing:"printingCount",

"Quality Check":"qualityCount",

Completed:"completeCount",

Archived:"archiveCount"

};




Object.entries(ids)

.forEach(([status,id])=>{


document.getElementById(id).textContent=

allQuotes.filter(
q=>q.status===status
).length;



});



}









// =============================
// SEARCH
// =============================


function setupSearch(){



let input=

document.getElementById(
"searchQuotes"
);



if(!input)
return;




input.addEventListener(
"input",
()=>{


let text=input.value.toLowerCase();



displayQuotes(

allQuotes.filter(q=>

(q.name||"")
.toLowerCase()
.includes(text)


||

(q.email||"")
.toLowerCase()
.includes(text)


||

(q.project_name||"")
.toLowerCase()
.includes(text)


)


);



});


}









// =============================
// FILTER
// =============================


function setupFilter(){

const filter =
document.getElementById("statusFilter");


if(!filter)
return;



filter.addEventListener(
"change",
()=>{


const value =
filter.value;



if(value==="all"){

displayQuotes(allQuotes);

return;

}



displayQuotes(

allQuotes.filter(
q=>q.status===value
)

);


});


}







// =============================
// STATUS CARD FILTERS
// =============================


function setupStatusCards(){


const cards =
document.querySelectorAll(
".filter-card"
);



cards.forEach(card=>{


card.addEventListener(
"click",
()=>{


const status =
card.dataset.status;



displayQuotes(

allQuotes.filter(
q=>q.status===status
)

);


});


});


}









// =============================
// ANALYTICS
// =============================


async function loadAnalytics(){


const {
data,
error
}

=
await supabaseClient

.from("site_visits")

.select("*");



if(error){

console.error(
"Analytics error:",
error
);

return;

}



const visits =
data || [];





// TOTAL


document.getElementById(
"totalVisitors"
).textContent =
visits.length;







// TODAY


const today =
new Date()
.toISOString()
.split("T")[0];



document.getElementById(
"todayVisitors"
).textContent =


visits.filter(
v=>{

let d =
v.created_at
?
new Date(v.created_at)
.toISOString()
.split("T")[0]
:
v.date;


return d===today;


}

).length;









// THIS WEEK


const weekAgo =
new Date();



weekAgo.setDate(
weekAgo.getDate()-7
);



document.getElementById(
"weekVisitors"
).textContent =


visits.filter(
v=>


new Date(
v.created_at
) >= weekAgo


).length;









// PAGE COUNTS


let pages={};



visits.forEach(v=>{


let page =
v.page || "/";


pages[page] =
(pages[page] || 0)+1;


});






let top="-";

let highest=0;



Object.entries(pages)

.forEach(
([page,count])=>{


if(count>highest){

highest=count;

top=page;

}


});




document.getElementById(
"topPage"
).textContent =
top;







// TABLE


const table =
document.getElementById(
"pageStats"
);



if(table){


table.innerHTML="";


Object.entries(pages)

.sort(
(a,b)=>b[1]-a[1]
)

.forEach(
([page,count])=>{


table.innerHTML += `

<tr>

<td>${page}</td>

<td>${count}</td>

</tr>

`;


});


}









// GRAPH


let labels=[];

let values=[];



for(let i=6;i>=0;i--){


let d =
new Date();


d.setDate(
d.getDate()-i
);



let day =
d.toISOString()
.split("T")[0];



labels.push(
day.substring(5)
);



values.push(

visits.filter(
v=>{


let visitDate =
v.created_at
?
new Date(v.created_at)
.toISOString()
.split("T")[0]
:
v.date;


return visitDate===day;


}

).length

);



}








if(visitorChart){

visitorChart.destroy();

}




const canvas =
document.getElementById(
"visitorChart"
);



if(canvas){


visitorChart =
new Chart(
canvas,
{

type:"line",

data:{


labels:labels,


datasets:[{

label:"Visitors",

data:values,

borderWidth:3,

tension:.3,

fill:true

}]


},



options:{


responsive:true,


maintainAspectRatio:false


}


}

);


}



}

// =============================
// COPY QUOTE ID
// =============================


window.copyQuoteID = async function(){


const id =

document.getElementById(
"adminQuoteID"
).textContent;



if(!id || id==="No ID"){

alert(
"No Quote ID available."
);

return;

}



await navigator.clipboard.writeText(id);



alert(
"Quote ID copied!"
);


}