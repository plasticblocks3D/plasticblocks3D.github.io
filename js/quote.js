console.log("QUOTE JS LOADED");


const form = document.getElementById("projectForm");


if (!form) {

    console.error("projectForm not found");

} else {


form.addEventListener("submit", async function(event) {


event.preventDefault();


const button = form.querySelector("button");


button.disabled = true;
button.innerHTML = "Processing...";



try {



const name =
document.getElementById("projectCustomerName")
.value
.trim();


const email =
document.getElementById("projectCustomerEmail")
.value
.trim();


const projectName =
document.getElementById("projectName")
.value
.trim();


const projectType =
document.getElementById("projectType")
.value;


const details =
document.getElementById("projectDetails")
.value
.trim();



const fileInput =
document.getElementById("projectFiles");



const files =
fileInput
?
Array.from(fileInput.files)
:
[];





// =================================
// FILE SECURITY
// =================================


const allowedExtensions = [

"stl",
"obj",
"3mf",
"step",
"stp",
"iges",
"igs",
"fbx",
"dae",
"blend",
"dwg",
"dxf",
"jpg",
"jpeg",
"png",
"webp",
"gif",
"pdf"

];



const maxFileSize =
50 * 1024 * 1024;



const maxTotalSize =
100 * 1024 * 1024;



let totalSize = 0;



for(const file of files){


const extension =

file.name
.split(".")
.pop()
.toLowerCase();



if(!allowedExtensions.includes(extension)){


throw new Error(

`File type not allowed:\n${file.name}`

);


}



if(file.size > maxFileSize){


throw new Error(

`${file.name} is larger than 50MB`

);


}



totalSize += file.size;



}




if(totalSize > maxTotalSize){


throw new Error(

"Total upload size cannot exceed 100MB"

);


}






// =================================
// UPLOAD FILES
// =================================


let fileLinks = [];



for(let i=0;i<files.length;i++){



const file = files[i];



button.innerHTML =

`Uploading ${i+1}/${files.length}...`;





const cleanName =

file.name.replace(
/[^a-zA-Z0-9.-]/g,
"_"
);





const filePath =

crypto.randomUUID()

+

"-"

+

cleanName;







const upload =

await supabaseClient

.storage

.from("quote-files")

.upload(

filePath,

file,

{

cacheControl:"3600",

upsert:false

}

);





if(upload.error){


throw upload.error;


}







const url =

supabaseClient

.storage

.from("quote-files")

.getPublicUrl(filePath)

.data

.publicUrl;





fileLinks.push(url);



}








// =================================
// SAVE REQUEST
// =================================



button.innerHTML =
"Sending request...";





const result =

await supabaseClient

.from("quote_requests")

.insert([{


name:name,


email:email,


project_name:projectName,


project_type:projectType,


details:details,


file_link:fileLinks.join("\n"),


status:"New"


}]);






if(result.error){


throw result.error;


}






alert(
"Your project request was sent!"
);



window.location.href =
"../thank-you.html";





}

catch(error){



console.error(
error
);



alert(

"Unable to submit request:\n\n"

+

error.message

);



button.disabled=false;


button.innerHTML =
"Request Quote";



}



});


}