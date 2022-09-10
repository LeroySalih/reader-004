//
// https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-react#acquire-a-token
//

// Filter the Classes to only show the Dept Classesefe5r3

import React, { useEffect, useState } from "react";
import { PageLayout } from "./components/PageLayout";
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import Button from "react-bootstrap/Button";

import { ProfileData } from "./components/ProfileData";
import { ClassData} from './components/ClassData';

import { callMsGraph } from "./graph";
import { graphConfig} from './authConfig';


import Classes from './data/DeptClasses';

const onlyMyClasses = (classData, filterClasses) => {
  return classData.filter(c => filterClasses.includes(c.displayName))
}

const fetchClassData = async (instance, account, loginRequest)  => {

  const request = {
      ...loginRequest,
      account 
  };

    
  // Load Classes Data
  try{
    const token = await instance.acquireTokenSilent(request);
    const replyData = await callMsGraph(token.accessToken, graphConfig.graphMyClassesEndpoint);
    return (onlyMyClasses(replyData, Classes))
  } 
  catch(e) {
    const token = await instance.acquireTokenRedirect(request);
    const replyData = await callMsGraph(token.accessToken, graphConfig.graphMyClassesEndpoint);
    return (onlyMyClasses(replyData, Classes))
  }

  /*
  // Silently acquires an access token which is then attached to a request for Microsoft Graph data
  instance.acquireTokenSilent(request)
  .then((response) => {
      callMsGraph(response.accessToken, graphConfig.graphMyClassesEndpoint)
      .then((response) => {  setGraphData(onlyMyClasses(response))});
  })
  .catch((e) => {
      instance.acquireTokenPopup(request).then((response) => {
          callMsGraph(response.accessToken, graphConfig.graphMyClassesEndpoint).then(response => setGraphData(response));
      });
  });
  */
}

const fetchAssignmentData = async (instance, account, loginRequest, classId)  => {

  const request = {
      ...loginRequest,
      account 
  };

  
  // Load Classes Data
  try{
    const token = await instance.acquireTokenSilent(request);
    const replyData = await callMsGraph(token.accessToken, graphConfig.graphClassAssignments(classId));
    console.log("replyData", replyData)
    
    return (replyData)
  } 
  catch(e) {
    const token = await instance.acquireTokenRedirect(request);
    const replyData = await callMsGraph(token.accessToken, graphConfig.graphClassAssignments(classId));
    return (replyData)
  }

  /*
  // Silently acquires an access token which is then attached to a request for Microsoft Graph data
  instance.acquireTokenSilent(request)
  .then((response) => {
      callMsGraph(response.accessToken, graphConfig.graphMyClassesEndpoint)
      .then((response) => {  setGraphData(onlyMyClasses(response))});
  })
  .catch((e) => {
      instance.acquireTokenPopup(request).then((response) => {
          callMsGraph(response.accessToken, graphConfig.graphMyClassesEndpoint).then(response => setGraphData(response));
      });
  });
  */
}



function App() {

  const { instance, accounts } = useMsal();
  const [ classData, setClassData] = useState(null);
  const [ assignmentData, setAssignmentData] = useState(null);

  // const name = accounts[0] && accounts[0].name;


  useEffect( () => {

    // Load the initial class Data
    const getClassData = async () => {
      const classData = await  fetchClassData(instance, accounts[0], loginRequest)
      setClassData(classData);
    }

    getClassData();

  }, []);

  


  useEffect( () => {
    
    if (classData === null)
      return

    const getAssignmentData = async () => {
      const classId = "8f1dc547-8f7e-4a3c-b592-601456238ea9"
      
      const assignmentData = await fetchAssignmentData(instance, accounts[0], loginRequest, classId);
      
      setAssignmentData(assignmentData)
    }   
    
    getAssignmentData()
    
  }, [classData])


  return (
      <PageLayout>
          <AuthenticatedTemplate>
              <ProfileContent />
              {classData && <ClassContent classData={classData} assignmentData={assignmentData}/>}
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <p>You are not signed in! Please sign in.</p>
            </UnauthenticatedTemplate>
      </PageLayout>
  );
}


function ProfileContent() {
  const { instance, accounts } = useMsal();
  const [graphData, setGraphData] = useState(null);

  const name = accounts[0] && accounts[0].name;

  function RequestProfileData() {
      const request = {
          ...loginRequest,
          account: accounts[0]
      };

      // Silently acquires an access token which is then attached to a request for Microsoft Graph data
      instance.acquireTokenSilent(request).then((response) => {
          callMsGraph(response.accessToken).then(response => setGraphData(response));
      }).catch((e) => {
          instance.acquireTokenPopup(request).then((response) => {
              callMsGraph(response.accessToken).then(response => setGraphData(response));
          });
      });
  }

  return (
      <>
          <h5 className="card-title">Welcome {name}</h5>
          {graphData ? 
              <ProfileData graphData={graphData} />
              :
              <Button variant="secondary" onClick={RequestProfileData}>Request Profile Information</Button>
          }
      </>
  );
};

function ClassContent({classData, assignmentData}){
  
  return (
      <>
          <h5 className="card-title">Class Data</h5>
          <ClassData classData={classData} assignmentData={assignmentData}/>
      </>
  );
}



export default App;
