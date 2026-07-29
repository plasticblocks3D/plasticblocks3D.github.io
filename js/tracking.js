console.log("Visitor tracking loaded");


async function trackVisit() {

    const visitorID =
        localStorage.getItem("visitor_id") ||
        crypto.randomUUID();

    localStorage.setItem(
        "visitor_id",
        visitorID
    );


    const now = new Date();


    const visit = {

        visitor_id: visitorID,

        hour: now.getHours(),

        date: now.toISOString().split("T")[0],

        page: window.location.pathname

    };


    console.log("Sending visit:", visit);


    const result = await supabaseClient
        .from("site_visits")
        .insert(visit);


    console.log(
        "FULL SUPABASE RESULT:",
        result
    );


    if(result.error){

        console.error(
            "ANALYTICS FAILED:",
            result.error.message
        );

    }

    else {

        console.log(
            "Analytics saved!"
        );

    }

}


trackVisit();