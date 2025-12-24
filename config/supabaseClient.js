const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://bavhrnswhdheweqajczg.supabase.co"
const supabaseKey = 'sb_secret_1UN3BqUeZk6hNdN4RX8_Qg_BfCrg7Lg' // SERVICE ROLE KEY

const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = supabase
 
