console.log("QUOTE JS LOADED");


const form = document.getElementById("projectForm");


form.addEventListener("submit", async function(event){

event.preventDefault();


const button = this.querySelector("button");


button.disabled = true;
button.innerHTML = "Uploading files...";



const name =
document.getElementById("projectCustomerName").value.trim();


const email =
document.getElementById("projectCustomerEmail").value.trim();


const projectName =
document.getElementById("projectName").value.trim();


const projectType =
document.getElementById("projectType").value;


const details =
document.getElementById("projectDetails").value.trim();


const fileInput =
document.getElementById("projectFiles");


const files =
Array.from(fileInput.files);



let uploadedFiles = [];





// ===============================
// UPLOAD FILES
// ===============================


try{


for(let file of files){


button.innerHTML =
`Uploading ${uploadedFiles.length + 1}/${files.length}...`;



const cleanName =
file.name.replace(
/[^a-zA-Z0-9.-]/g,
"_"
);



const path =
`${crypto.randomUUID()}-${cleanName}`;





const {error} =

await supabaseClient

.storage

.from("quote-files")

.upload(

path,

file,

{

cacheControl:"3600",

upsert:false

}

);



if(error){

throw error;

}





const publicURL =

supabaseClient

.storage

.from("quote-files")

.getPublicUrl(path)
.data.publicUrl;



uploadedFiles.push({

name:file.name,

url:publicURL

});



}



}

catch(error){


console.error(
"UPLOAD FAILED",
error
);



alert(
"File upload failed. Check Supabase Storage permissions."
);



button.disabled=false;

button.innerHTML =
"Request Quote";


return;


}





// ===============================
// SAVE REQUEST
// ===============================


button.innerHTML =
"Sending request...";



const fileText =

uploadedFiles

.map(

file =>
`${file.name}: ${file.url}`

)

.join("\n");





const {error} =

await supabaseClient

.from("quote_requests")

.insert([

{

name,

email,

project_name:projectName,

project_type:projectType,

details,

file_link:fileText,

status:"New"

}

]);






if(error){


console.error(
error
);


alert(
"Could not submit request."
);



button.disabled=false;

button.innerHTML =
"Request Quote";


return;


}





alert(
"Your project request was sent!"
);



window.location.href =
"../thank-you.html";



});