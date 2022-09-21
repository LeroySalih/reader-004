
import { useEffect, useState } from 'react';
import supabase from '../config/supabaseClient';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";

import { loginRequest } from "../authConfig";
import { callMsGraph, getUrlFromContext, graphConfig, graphContext } from '../components/callMsGraph';

import {Link} from 'react-router-dom'
import DeptClasses from '../data/DeptClasses';
import { clear } from '@testing-library/user-event/dist/clear';





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




  const fetchData = async (instance, account, loginRequest, context)  => {

    const request = {
        ...loginRequest,
        account 
    };


    const{url, error} = await getUrlFromContext(context)
    console.log("URL From Context is:", url)
  
    
    // Load Classes Data
    try{
      const token = await instance.acquireTokenSilent(request);
      const replyData = await callMsGraph(token.accessToken, url);
      return (replyData)
      // return (onlyMyClasses(replyData))
    } 
    catch(e) {
      console.error(e)
      const token = await instance.acquireTokenRedirect(request);
      const replyData = await callMsGraph(token.accessToken, url);

      return (replyData)
      // return (onlyMyClasses(replyData))
    }
  
  }

  const fetchClassData = async (instance, account, loginRequest)  => {

    const classes = await fetchData(instance, account, loginRequest, "getClasses");

    return onlyMyClasses(classes);
  }

  const fetchAssignmentData = async (instance, account, loginRequest)  => {

    const assignments = await fetchData(instance, account, loginRequest, "getAssignments");

    return assignments;
  }




const getAllClasses = async () => {

  const {data, error} = await supabase.from("Classes").select()

  console.log("getAllClasses", data)

  return {classes: data, classesGetError: error}
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



const fetchClassMembersData = async (instance, account, loginRequest, classId)  => {

    console.log("Getting Class Members Data");
  
    const request = {
        ...loginRequest,
        account 
    };
    
  // Load Classes Data
  try{
    const token = await instance.acquireTokenSilent(request);
    const replyData = await callMsGraph(token.accessToken, graphConfig.graphClassMembers(classId));
    // return (replyData)
    return (replyData)
  } 
  catch(e) {
    console.error(e)
    const token = await instance.acquireTokenRedirect(request);
    const replyData = await callMsGraph(token.accessToken, graphConfig.graphClassMembers(classId));
    // return (replyData)
    return (replyData)
  }

}


const fetchSubmissionsForAssignmentData = async (instance, account, loginRequest, classId, assignmentId)  => {

  console.log("Getting Class Members Data");

  const request = {
      ...loginRequest,
      account 
  };
  
// Load Classes Data
try{
  const token = await instance.acquireTokenSilent(request);
  const replyData = await callMsGraph(token.accessToken, graphConfig.graphSubmissions(classId, assignmentId));
  // return (replyData)
  return (replyData)
} 
catch(e) {
  console.error(e)
  const token = await instance.acquireTokenRedirect(request);
  const replyData = await callMsGraph(token.accessToken, graphConfig.graphSubmissions(classId, assignmentId));
  // return (replyData)
  return (replyData)
}

}


/*
const writeUserDataToDb = async (memberData) => {

  console.table("Writting Member Data");

  if( memberData === null || memberData.length == 0)
    return;

  const {data, error, count} = await supabase
                                .from("Users")
                                .upsert(memberData.map( m => (
                                    {
                                      id: m.id, 
                                      givenName: m.givenName,
                                      surname: m.surname,
                                      email : m.userPrincipleName
                                    })
                                  ),
                                    {count: 'exact'}                                
                                );

  data !== null && console.log("data", data)
  error !== null && console.erro("error", error)
  count !== null && console.log("count", count)

}

*/

const writeClassDataToDb = async (classData) => {

  console.log("Writting Data to DB", classData)
  if (classData === null)
    return 

  const {classes, classesGetError} = await getAllClasses();

  console.log("getAllClasses", classes)

  const insertClasses = classData
                          .filter(c => !(Object.keys(classes).includes(c.id)))
                          .map(c => ({
                            id: c.id,
                            description :  c.description,
                            displayName :  c.displayName,
                            mailNickname : c.mailNickname
                          }));

  try{

    if (insertClasses.length === 0)
      return;

    
      console.log("Inserting", insertClasses)

      insertClasses.forEach(async (c) => {

        const {data, error} = await supabase
        .from("Classes")
        .upsert(c)

        data !== undefined && console.log("Data", data)
        error !== undefined && console.error("Error", error)
      })
      
    
  } catch(e) {
    console.error(e);
  }
  

}

const writeAssignmentDataToDb = async (assignmentData) => {


  console.log("Writting Assignment Data to DB", assignmentData)
  if (assignmentData === null)
    return
    
  
  const {data, error} = await supabase
                  .from("Assignments")
                  .insert(sliceAssigments(assignmentData, {upsert: true}))

  console.log("Data", data)
  console.error("Error", error)

}


const writeClassMemberToDb = async (cm, classId) => {
  
  const { data, error} = await supabase
  .from('ClassMembers')
  .upsert({classId: classId, userId: cm.id})
  // .insert([{ classId: classId, userId: cm.id}]);

  error != undefined && console.error(error)
  console.log("Added User ", cm.id, " to ", classId);

}

const writeUserToDb = async (cm) => {
  
  const { data, error} = await supabase
  .from('Users')
  .upsert({
      id: cm.id, 
      givenName: cm.givenName,
      surname: cm.surname,
      email: cm.userPrincipalName
    })
  // .insert([{ classId: classId, userId: cm.id}]);

  error != undefined && console.error(error)
  console.log("Added User", cm.id);

}

const writeClassMembersToDb = async (classsMemberData, classId) => {

  if (classsMemberData === null || classsMemberData.length == 0){
    return;
  }

  classsMemberData.forEach(async (cm) => {
    
    console.log( "Writting ClassMember", cm);

    
    /*
    const {result: data, error} = await supabase.rpc('upsertmember', {
      iclassid: cm.classId,
      iuserid: cm.id,
      igivenname: cm.givenName,
      isurname: cm.surname,
      iemail: cm.email
    });
    */
    await writeClassMemberToDb(cm, classId);
    await writeUserToDb(cm);
  });

  
}

const writeSubmissionToDb = async(submission, classId, assignmentId) => {

    if (submission === undefined)
      return;

    const {data, error} = await supabase
        .from("Submissions")
        .upsert({
          id: submission.id,
          classId,
          assignmentId,
          status: submission.status,
          submittedDate: submission.submittedDateTime,
          returnedDate: submission.returnedDateTime
        });

      error != undefined && console.error(error)
      console.log("Added Submission ", submission.id);
}


const writeSubmissionsToDb = async (submissions, classId, assignmentId) => {

  console.log("Submission", submissions, classId, assignmentId);
  //console.table(submissions);
  submissions.forEach(async (s) => {
    await writeSubmissionToDb(s, classId, assignmentId)
  })
}




export default () => {

    const [classData, setClassData ] = useState(null);
   
    const { instance, accounts } = useMsal();

    const msgTypes = {
      "class" : "class",
      "assignment" : "assignment",
      "user" : "user",
      "submission" : "submission"
    }
    
    
    // Can be block loaded through the graph api!
    // also doesn't support the delta api, so we need to call all and only process most recent (by default)
    const loadClassData = async () => {
        console.log("Loading Class Data")
        const result = await fetchClassData(instance, accounts[0])
        
        result.forEach(t => pushItemToQueue(msgTypes.class,  {classId: t.id}));

        await writeClassDataToDb(result)
    }

    // Can be block loaded through the graph api!
    // also doesn't support the delta api, so we need to call all and only process most recent (by default)
    const loadAssignmentDat = async () => {
      console.log("Loading Assignments")

      const assignments = await fetchAssignmentData(instance, accounts[0]);
        
        assignments.forEach(a => pushItemToQueue(msgTypes.assignment, {classId: a.classId, assignmentId: a.id}))
        
        await writeAssignmentDataToDb(assignments)

    }

    const loadAssignmentData = async () => {
      console.log("Loading Assignment Data")
      const result = await fetchAssignmentData(instance, accounts[0])
      result.forEach(r => pushItemToQueue("assignment", {classId: r.classId, assignmentId: r.id}))

      // console.table(result)
      // setClassData(result);
      writeAssignmentDataToDb(result)
    }

    const loadSubmissionData = async (classId, assignmentId) =>{
      // console.log("Loading Submission Data for", classId, assignmentId)
      // const result = await fetchSubmissionsData(instance, accounts[0])
      // result.forEach(s => pushItemToQueue("submission", {classId, assignmentId, submissionId: s.id}))
      // writeSubmissionsDataToDb(result)
    }

    
    const getNextItemFromQueue = async () => {

      const {data, error} = await supabase
          .from("Queue")
          .select()
          .order("created_at", {ascending: false})
          .limit(1)

        data !== undefined && data.length  > 0 && console.log("data", data[0].payload)
        error !== undefined && console.error(error)

        return data.length == 1 ? data[0] : null;
    }

    const removeFirstItemFromQueue = async (item) => {

      if (item === null){
        return;
      }

      const {data, error} = await supabase
        .from("Queue")
        .delete()
        .match({id: item.id})
    }

    const pushItemToQueue = async (type,payload) => {
      console.log("Adding to queue",  type, payload)
      const {data, error} = await supabase
        .from("Queue")
        .insert([{type, payload }]); 

    }

    const processItem = async(item) => {
      

      if (item == null)
        return;
      console.log("Processing Item ", item)
      const {payload} = item;

      switch (item.type){
        case msgTypes.class : 
                       console.log("Processing class ", payload.classId)
                       //await pushItemToQueue(msgTypes.assignment, {classId: payload.classId})

                       // get members for the class
                       // add members for the class
                       
                       if (false){
                        const result = await fetchClassMembersData(instance, accounts[0], loginRequest, payload.classId);
                        console.log("Members for Class", result)
                        await writeClassMembersToDb(result, payload.classId); 
                       }
                       
                       break;

        case msgTypes.assignment : 
                       console.log(`Processing Assignment ${payload.classId}::${payload.assignmentId}`);

                       const result = await fetchSubmissionsForAssignmentData(instance, accounts[0], loginRequest, payload.classId, payload.assignmentId);
                       console.log("Submissions for Assignment", result)
                       await writeSubmissionsToDb(result, payload.classId, payload.assignmentId)

                       //submissions.forEach(async (s) => await pushItemToQueue(msgTypes.submission, {classId: payload.classId, assignmentId: payload.assignmentId, submissionId: s.id}) )
                       
                       break;

        case msgTypes.submission : 
                      console.log(`Getting Outcomes for submission ${payload.classId}::${payload.assignmentId}::${payload.submissionId}`)
                      // get the outcomes for the submission
                      
                      break;

        default: console.error( "Unknown Payload Type", item);
      }
    }

    const clearQueue = async () => {
      console.log("Clearing queue!")
      const {data, error} = await supabase
                              .from('Queue')
                              .delete()
                              .neq("id", -1)

      error !== undefined && console.error(error)
      data !== undefined && console.log(data)
      
    }

    useEffect(() => {
      const checkQueue = async () => {
        console.log("Checking Queue!")

        const item = await getNextItemFromQueue();
        //console.log("Next Item ", item)

        await processItem(item)
        
        await removeFirstItemFromQueue(item);

      }

      // const timer = setInterval(checkQueue, 10000);

      // return () => clearInterval(timer)

    }, [])

  
    return <>
        <h1>Admin Page</h1>
        <UnauthenticatedTemplate>
          You must be signed in to access this page.
          <Link to='/'>Home</Link>
        </UnauthenticatedTemplate>
        <AuthenticatedTemplate>
            
            <button onClick={loadClassData}>Load Class Data</button>
            <button onClick={loadAssignmentData}>Load Assignment Data</button>
            <button onClick={clearQueue}>Clear Queue</button>
        </AuthenticatedTemplate>
        
    
    </>
}