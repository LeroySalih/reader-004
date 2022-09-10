export const msalConfig = {
    auth: {
      clientId: "ec01aecc-f878-4a74-b606-49cedd47990c",
      authority: "https://login.microsoftonline.com/organizations", // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
      redirectUri: "https://6d58-95-184-127-138.in.ngrok.io",
    },
    cache: {
      cacheLocation: "sessionStorage", // This configures where your cache will be stored
      storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    }
  };
  
  // Add scopes here for ID token to be used at Microsoft identity platform endpoints.
  export const loginRequest = {
   scopes: ["User.Read", "EduRoster.ReadBasic"]
  };
  
  // Add the endpoints here for Microsoft Graph API services you'd like to use.
  export const graphConfig = {
      graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
      graphMyClassesEndpoint: "https://graph.microsoft.com/beta/education/classes",
      graphClassAssignments: (cId) => `https://graph.microsoft.com/beta/education/classes/${cId}/assignments`

  };