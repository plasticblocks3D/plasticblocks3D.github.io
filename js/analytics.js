console.log("Analytics page loaded.");

let visitorChart = null;


// ========================================
// START ANALYTICS
// ========================================

async function loadAnalytics() {

    try {

        await Promise.all([
            loadVisitorAnalytics(),
            loadQuoteAnalytics()
        ]);

    } catch (error) {

        console.error(
            "Analytics loading error:",
            error
        );

    }

}


// ========================================
// VISITOR ANALYTICS
// ========================================

async function loadVisitorAnalytics() {

    const { data: visits, error } =
        await supabaseClient
            .from("site_visits")
            .select("*")
            .order("date", {
                ascending: true
            });


    if (error) {

        console.error(
            "Could not load site visits:",
            error
        );

        document.getElementById(
            "pageStats"
        ).innerHTML = `

            <tr>
                <td colspan="2">
                    Unable to load visitor data.
                </td>
            </tr>

        `;

        return;

    }


    console.log(
        "Site visits:",
        visits
    );


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const weekAgo =
        new Date();

    weekAgo.setDate(
        weekAgo.getDate() - 7
    );


    const weekAgoString =
        weekAgo
            .toISOString()
            .split("T")[0];


    // ----------------------------------------
    // UNIQUE VISITORS
    // ----------------------------------------

    const totalVisitorIDs =
        new Set(
            visits.map(
                visit => visit.visitor_id
            )
        );


    const todayVisitorIDs =
        new Set(

            visits

                .filter(
                    visit =>
                        visit.date === today
                )

                .map(
                    visit =>
                        visit.visitor_id
                )

        );


    const weekVisitorIDs =
        new Set(

            visits

                .filter(
                    visit =>
                        visit.date >= weekAgoString
                )

                .map(
                    visit =>
                        visit.visitor_id
                )

        );


    document.getElementById(
        "totalVisitors"
    ).textContent =
        totalVisitorIDs.size;


    document.getElementById(
        "todayVisitors"
    ).textContent =
        todayVisitorIDs.size;


    document.getElementById(
        "weekVisitors"
    ).textContent =
        weekVisitorIDs.size;



    // ========================================
    // MOST VISITED PAGES
    // ========================================

    const pageCounts = {};


    visits.forEach(visit => {

        const page =
            visit.page || "/";


        if (!pageCounts[page]) {

            pageCounts[page] = 0;

        }


        pageCounts[page]++;

    });


    const sortedPages =
        Object.entries(pageCounts)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


    const pageStats =
        document.getElementById(
            "pageStats"
        );


    if (sortedPages.length === 0) {

        pageStats.innerHTML = `

            <tr>

                <td colspan="2">
                    No visitor data yet.
                </td>

            </tr>

        `;

    }

    else {

        pageStats.innerHTML =
            sortedPages

                .map(([page, views]) => `

                    <tr>

                        <td>
                            ${formatPageName(page)}
                        </td>

                        <td>
                            ${views}
                        </td>

                    </tr>

                `)

                .join("");

    }



    // ========================================
    // VISITOR CHART
    // ========================================

    createVisitorChart(visits);

}



// ========================================
// FORMAT PAGE NAME
// ========================================

function formatPageName(path) {

    if (
        path === "/" ||
        path === "/index.html"
    ) {

        return "Home";

    }


    let name =
        path
            .split("/")
            .pop()
            .replace(".html", "")
            .replace(/-/g, " ");


    return name
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}



// ========================================
// VISITOR CHART
// ========================================

function createVisitorChart(visits) {

    const canvas =
        document.getElementById(
            "visitorChart"
        );


    if (!canvas) {

        return;

    }


    const lastSevenDays = [];


    for (let i = 6; i >= 0; i--) {

        const date =
            new Date();

        date.setDate(
            date.getDate() - i
        );


        const dateString =
            date
                .toISOString()
                .split("T")[0];


        const label =
            date.toLocaleDateString(
                undefined,
                {
                    month: "short",
                    day: "numeric"
                }
            );


        const uniqueVisitors =
            new Set(

                visits

                    .filter(
                        visit =>
                            visit.date ===
                            dateString
                    )

                    .map(
                        visit =>
                            visit.visitor_id
                    )

            ).size;


        lastSevenDays.push({

            label,
            visitors: uniqueVisitors

        });

    }


    if (visitorChart) {

        visitorChart.destroy();

    }


    visitorChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels:
                        lastSevenDays.map(
                            day =>
                                day.label
                        ),

                    datasets: [

                        {

                            label:
                                "Unique Visitors",

                            data:
                                lastSevenDays.map(
                                    day =>
                                        day.visitors
                                ),

                            borderColor:
                                "#3b82f6",

                            backgroundColor:
                                "rgba(59, 130, 246, 0.15)",

                            borderWidth: 3,

                            tension: 0.35,

                            fill: true,

                            pointRadius: 4,

                            pointHoverRadius: 6

                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,


                    plugins: {

                        legend: {

                            labels: {

                                color:
                                    "#ffffff"

                            }

                        }

                    },


                    scales: {

                        x: {

                            ticks: {

                                color:
                                    "#cbd5e1"

                            },

                            grid: {

                                color:
                                    "rgba(255,255,255,0.06)"

                            }

                        },


                        y: {

                            beginAtZero: true,

                            ticks: {

                                color:
                                    "#cbd5e1",

                                precision: 0

                            },

                            grid: {

                                color:
                                    "rgba(255,255,255,0.06)"

                            }

                        }

                    }

                }

            }
        );

}



// ========================================
// QUOTE ANALYTICS
// ========================================

async function loadQuoteAnalytics() {

    const { data: quotes, error } =
        await supabaseClient
            .from("quote_requests")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Could not load quotes:",
            error
        );

        document.getElementById(
            "recentQuotes"
        ).textContent =
            "Unable to load quote activity.";

        return;

    }


    console.log(
        "Quotes:",
        quotes
    );


    // ========================================
    // TOTAL QUOTES
    // ========================================

    document.getElementById(
        "totalQuotes"
    ).textContent =
        quotes.length;



    // ========================================
    // COMPLETED PROJECTS
    // ========================================

    const completed =
        quotes.filter(quote => {

            const status =
                String(
                    quote.status || ""
                )
                    .trim()
                    .toLowerCase();


            return (
                status === "completed" ||
                status === "complete"
            );

        });


    document.getElementById(
        "completedProjects"
    ).textContent =
        completed.length;



    // ========================================
    // CONVERSION RATE
    // ========================================

    const visitorNumber =
        Number(
            document.getElementById(
                "totalVisitors"
            ).textContent
        );


    let conversionRate = 0;


    if (visitorNumber > 0) {

        conversionRate =
            (
                quotes.length /
                visitorNumber
            ) * 100;

    }


    document.getElementById(
        "conversionRate"
    ).textContent =
        conversionRate.toFixed(1) + "%";



    // ========================================
    // RECENT QUOTES
    // ========================================

    const recentQuotes =
        document.getElementById(
            "recentQuotes"
        );


    if (quotes.length === 0) {

        recentQuotes.innerHTML = `

            <p>
                No quote requests yet.
            </p>

        `;

        return;

    }


    recentQuotes.innerHTML =
        quotes
            .slice(0, 5)
            .map(quote => {

                const date =
                    quote.created_at

                        ? new Date(
                            quote.created_at
                        ).toLocaleString()

                        : "Unknown date";


                const name =
                    quote.name ||
                    "Unknown customer";


                const project =
                    quote.project_name ||
                    quote.project_type ||
                    "Project";


                const status =
                    quote.status ||
                    "Pending";


                return `

                    <div class="recent-quote-item">

                        <div>

                            <strong>
                                ${escapeHTML(name)}
                            </strong>

                            <p>
                                ${escapeHTML(project)}
                            </p>

                        </div>


                        <div>

                            <strong>
                                ${escapeHTML(status)}
                            </strong>

                            <p>
                                ${date}
                            </p>

                        </div>

                    </div>

                `;

            })

            .join("");

}



// ========================================
// BASIC HTML SAFETY
// ========================================

function escapeHTML(value) {

    const element =
        document.createElement("div");

    element.textContent =
        String(value ?? "");

    return element.innerHTML;

}



// ========================================
// LOAD EVERYTHING
// ========================================

loadAnalytics();