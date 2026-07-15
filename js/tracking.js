console.log("Tracking loaded");


function getVisitorID(){

    let id = localStorage.getItem("visitor_id");


    if(!id){

        id =
        crypto.randomUUID();

        localStorage.setItem(
            "visitor_id",
            id
        );

    }


    return id;

}



async function trackVisit(){


    const now = new Date();


    const visitData = {

        visitor_id:
        getVisitorID(),


        hour:
        now.getHours(),


        date:
        now.toISOString().split("T")[0],


        page:
        window.location.pathname

    };



    const {error} =
    await supabaseClient
    .from("site_visits")
    .insert([visitData]);



    if(error){

        console.error(
            "Tracking error:",
            error
        );

    }

    else{

        console.log(
            "Visit tracked"
        );

    }


}



trackVisit();