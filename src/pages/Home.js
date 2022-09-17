

import { useEffect } from 'react';
import supabase from '../config/supabaseClient';


const getAssignments = async ()=> {
    const {data, error} = await supabase.rpc('getclassassignments')
    //const {data, error} = await supabase.rpc('Test')

    console.error(error)
    console.table(data)
    
}


export default () => {


    useEffect(()=>{
        getAssignments();
    }, [])

    return <h1>Home Page</h1>
}