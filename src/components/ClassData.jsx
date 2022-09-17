import React, {useState, useEffect} from "react";

/**
 * Renders information about the user obtained from Microsoft Graph
 */
export const ClassData = ({classData, assignmentData, newProps}) => {
    
    
    const getAssignmentsForClass = (assignments, cId) => {

        if (!assignments)
            return []
        return assignments.filter(a => a.classId === cId)
    }

    
    const [assignments, setAssignments] = useState(assignmentData)

    useEffect(()=>{
        console.log("ClassData::useEffect", assignmentData)
        setAssignments(assignments)
    }, [assignmentData])
    return (
        <>
        <h1>Class Data</h1>
        {
            classData.map((c, i) => (
                <div key={i}>
                <pre >
                    { JSON.stringify(c, null, 2) }
                    
                </pre>
                <pre>
                    {JSON.stringify(getAssignmentsForClass(assignmentData, c.id))}
                </pre>
                </div>
                
                ))
        }

        {
            assignmentData && <pre>{JSON.stringify(assignmentData, null, 2)}</pre>
        }
        
        </>
    );
};