// =================================
// PROJECT TRACKING SYSTEM
// =================================


console.log(
"Project Tracking Loaded - VERSION 2"
);





const trackButton =
document.getElementById(
"trackButton"
);



const quoteSearch =
document.getElementById(
"quoteSearch"
);



const resultCard =
document.getElementById(
"resultCard"
);







if(trackButton){



trackButton.addEventListener(
"click",

async()=>{


const quoteID =

quoteSearch.value

.trim()

.toUpperCase();





if(!quoteID){


alert(
"Please enter your Quote ID."
);


return;


}






trackButton.innerHTML =
"Searching...";


trackButton.disabled=true;








const {

data,

error

}

=

await supabaseClient


.from("quote_requests")


.select(

"project_name, project_type, status, created_at, updated_at"

)


.eq(
"quote_id",
quoteID
)


.maybeSingle();





if(error || !data){



alert(

"Quote ID not found. Please check your number and try again."

);



trackButton.innerHTML =
"Check Status";


trackButton.disabled=false;


return;


}









document.getElementById(
"projectName"
).textContent =

data.project_name;







document.getElementById(
"projectType"
).textContent =

data.project_type;







const statusBox = document.getElementById("statusDisplay");

if(statusBox){

    statusBox.textContent = data.status;

}






document.getElementById(
"createdDate"
).textContent =


new Date(

data.created_at

)

.toLocaleDateString();







document.getElementById(
"updatedDate"
).textContent =


new Date(

data.updated_at

)

.toLocaleDateString();









await loadProjectTimeline(quoteID);



resultCard.style.display =
"block";






trackButton.innerHTML =
"Check Status";


trackButton.disabled=false;





}

);


}









// =============================
// LOAD PROJECT TIMELINE
// =============================


async function loadProjectTimeline(quoteID){



const timeline =

document.getElementById(
"projectTimeline"
);



if(!timeline)
return;







const {

data,

error

}

=

await supabaseClient


.from("quote_history")


.select("*")


.eq(
"quote_id",
quoteID
)


.order(
"changed_at",
{
ascending:true
}
);







if(error){


console.error(
"Timeline error:",
error
);



timeline.innerHTML =

"Unable to load timeline.";



return;


}







if(!data || data.length === 0){


timeline.innerHTML =


`

<p>
No status updates yet.
</p>

`;



return;


}







timeline.innerHTML = "";







// =================================
// CREATE PROFESSIONAL TIMELINE
// =================================


const workflow = [
    "New",
    "Reviewing",
    "Designing",
    "Printing",
    "Quality Check",
    "Completed"
];


const currentStatus = 
data[data.length - 1].new_status;



timeline.innerHTML = "";



workflow.forEach((status)=>{


    const historyItem = data.find(
        item => item.new_status === status
    );


    let state = "upcoming";


    if(historyItem){
        state = "complete";
    }


    if(status === currentStatus){
        state = "current";
    }



    timeline.innerHTML += `


<div class="timeline-step ${state}">


<div class="timeline-dot">

${state === "complete" ? "✓" : state === "current" ? "●" : ""}

</div>



<div class="timeline-content">


<h4>
${status}
</h4>



<p>

${
state === "current"
?
"Current Status"
:
state === "complete"
?
"Completed"
:
"Waiting"
}

</p>



${
historyItem
?
`
<span>
${new Date(historyItem.changed_at).toLocaleDateString()}
</span>
`
:
""
}



</div>


</div>


`;


});



}