console.log("QUOTE JS LOADED");


document
.getElementById("projectForm")
.addEventListener("submit", async function(event){


event.preventDefault();


const button = this.querySelector("button");


button.disabled = true;
button.textContent = "Uploading...";



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


const files =
document.getElementById("projectFiles").files;



let uploadedLinks = [];




// =====================================
// UPLOAD FILES
// =====================================


try {


for(const file of files){



// Create safe filename

const safeName = file.name
.replace(/[^a-zA-Z0-9.-]/g, "_");



const fileName =

Date.now()
+
"-"
+
safeName;





const {error: uploadError} =

await supabaseClient

.storage

.from("quote-files")

.upload(

fileName,

file,

{

cacheControl:"3600",

upsert:false

}

);





if(uploadError){


console.error(
"UPLOAD ERROR:",
uploadError
);


throw uploadError;


}




const {data:urlData} =

supabaseClient

.storage

.from("quote-files")

.getPublicUrl(fileName);




uploadedLinks.push(

urlData.publicUrl

);



}


}

catch(error){



alert(
"File upload failed. Please try again."
);



console.error(error);



button.disabled=false;

button.textContent =
"Request Quote";


return;


}







const fileLinks =

uploadedLinks.join("\n");





button.textContent =
"Sending...";







// =====================================
// SAVE QUOTE REQUEST
// =====================================


const {error} =

await supabaseClient

.from("quote_requests")

.insert([


{

name:name,

email:email,

project_name:projectName,

project_type:projectType,

details:details,

file_link:fileLinks,

status:"New"

}


]);







if(error){



console.error(
"DATABASE ERROR:",
error
);



alert(
"Something went wrong submitting your request."
);



button.disabled=false;

button.textContent =
"Request Quote";


return;


}








// =====================================
// SUCCESS
// =====================================


window.location.href =

"../thank-you.html";



});