
import { useEffect, useState } from 'react';
import supabase from '../config/supabaseClient';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";

import { loginRequest } from "../authConfig";
import { callMsGraph, graphConfig } from '../components/callMsGraph';

import {Link} from 'react-router-dom'
import DeptClasses from '../data/DeptClasses';

const getAssignments = async ()=> {
    const {data, error} = await supabase.rpc('getclassassignments')
    //const {data, error} = await supabase.rpc('Test')

    console.error(error)
    console.table(data)
    
}





const onlyMyClasses = (classData) => {
    console.table(classData.sort((a, b) => a.displayName > b.displayName ? 1 : -1))
    
    return classData
            .filter(c => DeptClasses.includes(c.displayName))
            .sort((a, b) => a.displayName > b.displayName ? 1 : -1)
  }


const fetchClassData = async (instance, account, loginRequest)  => {

    console.log("Getting Class Data")
    const request = {
        ...loginRequest,
        account 
    };
  
      
    // Load Classes Data
    try{
      const token = await instance.acquireTokenSilent(request);
      const replyData = await callMsGraph(token.accessToken, graphConfig.graphMyClassesEndpoint);
      // return (replyData)
      return (onlyMyClasses(replyData))
    } 
    catch(e) {
      const token = await instance.acquireTokenRedirect(request);
      const replyData = await callMsGraph(token.accessToken, graphConfig.graphMyClassesEndpoint);
      // return (replyData)
      return (onlyMyClasses(replyData))
    }
  
  }

const writeClassDataToDb = async (classData) => {

    console.log("Writting Data to DB", classData)
    if (classData === null)
      return 

    const {data, error} = await supabase
                    .from("Classes")
                    .insert(classData)

    console.log("Data", data)
    console.error("Error", error)

}

const sliceAssigments = (assignmentData) => {
  return assignmentData.map(a => ({
    id: a.id,
    classId: a.classId,
    displayName: a.displayName, 
    webUrl: a.webUrl,
    
    createdDateTime: a.createdDateTime,
    dueDateTime: a.dueDateTime
  }))
}

const fetchAssignmentData = async (instance, account, loginRequest)  => {

  console.log("Getting Assignment Data")
  const request = {
      ...loginRequest,
      account 
  };

    
  // Load Classes Data
  try{
    const token = await instance.acquireTokenSilent(request);
    const replyData = await callMsGraph(token.accessToken, graphConfig.graphClassAssignments);
    // return (replyData)
    return (replyData)
  } 
  catch(e) {
    const token = await instance.acquireTokenRedirect(request);
    const replyData = await callMsGraph(token.accessToken, graphConfig.graphClassAssignments);
    // return (replyData)
    return (replyData)
  }

}

const writeAssignmentDataToDb = async (assignmentData) => {

  console.log("Writting Assignment Data to DB", assignmentData)
  if (assignmentData === null)
    return 

  const {data, error} = await supabase
                  .from("Assignments")
                  .insert(sliceAssigments(assignmentData))

  console.log("Data", data)
  console.error("Error", error)

}



export default () => {

    const [classData, setClassData ] = useState(null);

    const loadClassData = async () => {
        console.log("Loading Class Data")
        const result = await fetchClassData(instance, accounts[0])
        console.table(result)
        // setClassData(result);
        writeClassDataToDb(result)
    }

    const loadAssignmentData = async () => {
      console.log("Loading Assignment Data")
      const result = await fetchAssignmentData(instance, accounts[0])
      console.table(result)
      // setClassData(result);
      writeAssignmentDataToDb(result)
  }

    const { instance, accounts } = useMsal();


    return <>
        <h1>Admin Page</h1>
        <UnauthenticatedTemplate>
          You must be signed in to access this page.
          <Link to='/'>Home</Link>
        </UnauthenticatedTemplate>
        <AuthenticatedTemplate>
            <button onClick={loadClassData}>Load Class Data</button>
            <button onClick={loadAssignmentData}>Load Assignment Data</button>
        </AuthenticatedTemplate>
        
    
    </>
}