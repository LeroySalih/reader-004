import supabase from '../config/supabaseClient';

export const graphConfig = {
    
    // Delta on Assignments is not supported!
    getClasses: "https://graph.microsoft.com/beta/education/me/classes",
    getAssignments: `https://graph.microsoft.com/beta/education/me/assignments`,
    
    graphClassMembers: (classId) => `https://graph.microsoft.com/v1.0/education/classes/${classId}/members/microsoft.graph.delta()`,
    graphSubmissions: (classId, assignmentId) => `https://graph.microsoft.com/beta/education/classes/${classId}/assignments/${assignmentId}/submissions/microsoft.graph.delta()`
};


export const graphContext = {
    getClasses: "https://graph.microsoft.com/beta/$metadata#Collection(educationClass)",
    getAssignments: "https://graph.microsoft.com/beta/$metadata#education/me/assignments"
}




export const getUrlFromContext = async (key) => {

    // key => getClasses
    const context = graphContext[key]
    console.log("Using Key", key)
    const {data, error} = await supabase
                                    .from("GraphCache")
                                    .select()
                                    .match({context})
  
    const url = (data != undefined && data.length > 0) ? data[0].url : graphConfig[key]
    console.table("URL From Cache", url)
    return {url, error }
  
  }

export async function callMsGraph(accessToken,  endPoint=graphConfig.graphMeEndpoint, values=[]) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;
    
    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

   
    // console.log("endPoint", endPoint)

    return fetch(endPoint, options)
        .then(async (response) => {
            
            const reply = await response.json()

            console.table(
                {
                    context: reply["@odata.context"], 
                    value: reply.hasOwnProperty('value'),
                    nextLink: reply["@odata.nextLink"],
                    deltaLink: reply["@odata.deltaLink"]
                }
                
            )

            if (reply["@odata.deltaLink"] != undefined){
                const {data, error} = await supabase.from("GraphCache").upsert({
                    context:  reply["@odata.context"],
                    url: reply["@odata.deltaLink"]
                });
            }


            if (reply.hasOwnProperty('value') === false) {
                return reply
            }

            values = [...values, ...reply["value"]];

            console.log("Building Values", values)
            //console.table(values);

        
            if (reply["@odata.nextLink"]){
                return callMsGraph(accessToken, reply["@odata.nextLink"], values)
            } else {
                console.log("Last page of data", reply);
                return values;
            }
        
        })
        .catch(error => console.error(error));
}

