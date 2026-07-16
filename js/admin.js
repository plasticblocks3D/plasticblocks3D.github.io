console.log("ADMIN DASHBOARD LOADED");


let allQuotes = [];

let selectedQuote = null;

let visitorChart = null;

let activeStatusFilter = null;



// =====================================================
// START
// =====================================================


document.addEventListener(
"DOMContentLoaded",
async function(){


if(!await checkLogin()){
return;
}



setupButtons();

setupSearch();

setupFilter();

setupStatusCards();



await loadQuotes();

await loadAnalytics();



});









// =====================================================
// AUTH
// =====================================================


async function checkLogin(){


const {
data,
error
}

=
await supabaseClient.auth.getSession();




if(error){

console.error(error);

return false;

}



if(!data.session){

window.location.href =
"login.html";

return false;

}



return true;


}









// =====================================================
// BUTTONS
// =====================================================


function setupButtons(){


const logout =
document.getElementById(
"logoutButton"
);



if(logout){


logout.onclick = async()=>{


await supabaseClient.auth.signOut();


window.location.href =
"login.html";


};


}





const refresh =
document.getElementById(
"refreshButton"
);



if(refresh){


refresh.onclick = async()=>{


await loadQuotes();

await loadAnalytics();


};


}



}









// =====================================================
// LOAD QUOTES
// =====================================================


async function loadQuotes(){



const {
data,
error
}

=
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
"QUOTE LOAD ERROR:",
error
);

return;

}





allQuotes =
data || [];



updateCounters();



displayQuotes(
allQuotes
);



}









// =====================================================
// DISPLAY QUOTES
// =====================================================


function displayQuotes(quotes){



const box =
document.getElementById(
"quotes"
);



box.innerHTML="";





if(quotes.length===0){


box.innerHTML =
"<p>No requests found.</p>";


return;


}






quotes.forEach(q=>{



box.innerHTML += `


<div class="quote-card"

onclick="openQuote('${q.id}')">


<h3>

${q.project_name}

</h3>



<p>

${q.name}

</p>



<p>

${q.project_type}

</p>



<span>

${q.status}

</span>



</div>


`;



});



}









// =====================================================
// OPEN QUOTE
// =====================================================


window.openQuote =
function(id){



selectedQuote =
allQuotes.find(
q=>q.id==id
);




if(!selectedQuote)
return;





const panel =
document.getElementById(
"detailsPanel"
);





panel.innerHTML = `



<h2>

${selectedQuote.project_name}

</h2>



<p>

<b>Name:</b>
${selectedQuote.name}

</p>



<p>

<b>Email:</b>
${selectedQuote.email}

</p>



<p>

<b>Type:</b>
${selectedQuote.project_type}

</p>




<p>

${selectedQuote.details}

</p>




<select id="statusEditor">


<option>
New
</option>


<option>
Reviewing
</option>


<option>
Quoted
</option>


<option>
Approved
</option>


<option>
Printing
</option>


<option>
Completed
</option>


<option>
Archived
</option>


</select>



<br><br>



<button onclick="saveStatus()">

Save Status

</button>



`;




document.getElementById(
"statusEditor"
).value =
selectedQuote.status;



};









// =====================================================
// SAVE STATUS
// =====================================================


window.saveStatus =
async function(){



let status =
document.getElementById(
"statusEditor"
).value;





const {
error
}

=
await supabaseClient

.from("quote_requests")

.update({

status:status

})

.eq(
"id",
selectedQuote.id
);






if(error){

console.error(error);

return;

}





await loadQuotes();



};









// =====================================================
// COUNTERS
// =====================================================


function updateCounters(){



const counters = {


"New":
"newCount",


"Reviewing":
"reviewCount",


"Quoted":
"quoteCount",


"Printing":
"printingCount",


"Completed":
"completeCount",


"Archived":
"archiveCount"



};






Object.entries(counters)

.forEach(
([status,id])=>{



document.getElementById(id)
.textContent =


allQuotes.filter(
q=>q.status===status
)
.length;



});



}









// =====================================================
// SEARCH
// =====================================================


function setupSearch(){



const search =
document.getElementById(
"searchQuotes"
);



if(!search)
return;





search.addEventListener(
"input",
()=>{



let text =
search.value.toLowerCase();





displayQuotes(

allQuotes.filter(q=>


q.name.toLowerCase()
.includes(text)


||

q.email.toLowerCase()
.includes(text)


||

q.project_name.toLowerCase()
.includes(text)



)


);



});



}









// =====================================================
// DROPDOWN FILTER
// =====================================================


function setupFilter(){



const filter =
document.getElementById(
"statusFilter"
);



if(!filter)
return;




filter.addEventListener(
"change",
()=>{



if(filter.value==="all"){


activeStatusFilter=null;


displayQuotes(
allQuotes
);


return;


}




activeStatusFilter =
filter.value;



displayQuotes(

allQuotes.filter(
q=>
q.status===filter.value
)

);



});



}









// =====================================================
// CLICKABLE STATUS CARDS
// =====================================================


function setupStatusCards(){



document

.querySelectorAll(
".filter-card"
)

.forEach(card=>{


card.addEventListener(
"click",
()=>{



let status =
card.dataset.status;





document

.querySelectorAll(
".filter-card"
)

.forEach(c=>{

c.classList.remove(
"active"
);

});






if(activeStatusFilter===status){


activeStatusFilter=null;


displayQuotes(
allQuotes
);


return;


}





activeStatusFilter=status;



card.classList.add(
"active"
);





displayQuotes(

allQuotes.filter(
q=>
q.status===status
)

);



});



});



}









// =====================================================
// ANALYTICS
// =====================================================


async function loadAnalytics(){



const {
data,
error
}

=
await supabaseClient

.from("site_visits")

.select(
"id,created_at,date,page,visitor_id"
)

.order(
"created_at",
{
ascending:true
}
);






if(error){

console.error(
"ANALYTICS ERROR:",
error
);

return;

}





const visits =
data || [];






document.getElementById(
"totalVisitors"
).textContent =
visits.length;







const today =
new Date()
.toISOString()
.substring(0,10);





document.getElementById(
"todayVisitors"
).textContent =


visits.filter(
v=>v.date===today
)
.length;







let week =
new Date();


week.setDate(
week.getDate()-7
);





document.getElementById(
"weekVisitors"
).textContent =


visits.filter(
v=>

new Date(v.created_at)>=week

)

.length;







let pages={};



visits.forEach(v=>{


let page =
v.page || "/";


pages[page]=
(pages[page]||0)+1;



});







let top="-";

let highest=0;



Object.entries(pages)
.forEach(([page,count])=>{


if(count>highest){

highest=count;

top=page;

}


});





document.getElementById(
"topPage"
).textContent =
top;








const table =
document.getElementById(
"pageStats"
);



table.innerHTML="";



Object.entries(pages)

.sort(
(a,b)=>b[1]-a[1]
)

.forEach(
([page,count])=>{


table.innerHTML += `


<tr>

<td>
${page}
</td>


<td>
${count}
</td>


</tr>


`;


});







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
.substring(0,10);




labels.push(
day.substring(5)
);



values.push(

visits.filter(
v=>v.date===day
)
.length

);



}





if(visitorChart){

visitorChart.destroy();

}




visitorChart =

new Chart(

document.getElementById(
"visitorChart"
),

{


type:"line",


data:{


labels:labels,


datasets:[{

label:"Visitors",

data:values


}]


},



options:{


responsive:true


}


}



);



}