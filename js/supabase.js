const SUPABASE_URL = "https://yalzogjuootvqanflggx.supabase.co";

const SUPABASE_KEY = "sb_publishable_VRmhTrfIDWLfDYA53jwMPg_hU8twDsh";


const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("Supabase URL:", SUPABASE_URL);