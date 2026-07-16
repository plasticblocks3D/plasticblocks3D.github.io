console.log("Visitor tracking loaded");


async function trackVisit() {

    try {

        let visitorID = localStorage.getItem("visitor_id");


        if (!visitorID) {

            visitorID = crypto.randomUUID();

            localStorage.setItem(
                "visitor_id",
                visitorID
            );

        }


        const now = new Date();


        const visitData = {

            visitor_id: visitorID,

            hour: now.getHours(),

            date: now.toISOString().split("T")[0],

            page: window.location.pathname

        };


        console.log(
            "Sending visit:",
            visitData
        );


        const { data, error } = await supabaseClient
            .from("site_visits")
            .insert(visitData)
            .select();



        if(error){

            console.error(
                "Tracking failed:",
                error
            );

            return;

        }


        console.log(
            "Visit recorded:",
            data
        );


    }

    catch(err){

        console.error(
            "Tracking exception:",
            err
        );

    }


}


trackVisit();