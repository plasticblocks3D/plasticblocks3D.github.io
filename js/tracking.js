console.log("TRACKING LOADED");


async function trackVisit(){


const page =
window.location.pathname;



const {error} = await supabaseClient

.from("site_visits")

.insert([

{

page:page

}

]);


if(error){

console.error(
"Tracking error:",
error
);

}

else{

console.log(
"Visit recorded"
);

}


}



trackVisit();