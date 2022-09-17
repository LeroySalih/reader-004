export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
    graphMyClassesEndpoint: "https://graph.microsoft.com/beta/education/classes",
    graphClassAssignments: `https://graph.microsoft.com/beta/education/me/assignments`
};


export async function callMsGraph(accessToken, endPoint=graphConfig.graphMeEndpoint, values=[]) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;
    
    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

   
    console.log("endPoint", endPoint)

    return fetch(endPoint, options)
        .then(async (response) => {
            
            const reply = await response.json()

            if (reply.hasOwnProperty('value') === false) {
                return reply
            }

            values = [...values, ...reply["value"]];

            if (reply["@odata.nextLink"]){
                return callMsGraph(accessToken, reply["@odata.nextLink"], values)
            } else {
                return values;
            }
        
        })
        .catch(error => console.log(error));
}

