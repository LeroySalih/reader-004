import { createClient } from '@supabase/supabase-js'

const NEXT_PUBLIC_SUPABASE_URL="https://wjuoilyjozfanjhtnllm.supabase.co"
const NEXT_PUBLIC_SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqdW9pbHlqb3pmYW5qaHRubGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjMyNTQ5NjQsImV4cCI6MTk3ODgzMDk2NH0.yhdAEarnQ8LxfqPffPgzhmU35aPG4OCpE_dFMPCbKgo"





console.log("URL" , NEXT_PUBLIC_SUPABASE_URL )
console.log("KEY" , NEXT_PUBLIC_SUPABASE_KEY)


const supabaseUrl = NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = NEXT_PUBLIC_SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const channel = supabase
  .channel('db-changes')
  .on('postgres_changes', { event: '*', schema: '*' }, (payload) =>
    console.log("CHANGE DETECTED", payload)
  )
  .subscribe()


export default supabase