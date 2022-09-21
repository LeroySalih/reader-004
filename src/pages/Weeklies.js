

import { useState, useEffect } from "react"
import supabase from "../config/supabaseClient"
import spacetime from 'spacetime'
import { DateTime } from "luxon";

import DeptClasses from "../data/DeptClasses"

export default () => {

    const [classAssignemnts, setClassAssignments] = useState(null);
    const [currentWeek, setCurrentWeek] = useState(null);

    const getClassAsignments = async () => {
        const {data, error} = await supabase
                                    .rpc("getclassassignments")

        error && console.error(error)
        
        setClassAssignments(data)

        return data
    }

    useEffect(()=>{
        getClassAsignments()
        
    }, [])

    useEffect(()=>{
        classAssignemnts && setCurrentWeek(Object.keys(configureClassAssignments(classAssignemnts))[0])
    }, 
    [classAssignemnts])


    const configureClassAssignments = (classAssignemnts) => {
        
        if (classAssignemnts === null){
            return
        }
        return classAssignemnts
                    .map(ca => {
                        const dueWeek = spacetime(ca["Due Date"])
                                            .weekStart("Sunday")
                                            .startOf('week')
                                            .format("yyyy-mmm-dd")
                        

                        return {...ca, 
                                assignmentTitle:ca["Assignment Title"], 
                                dueDate: ca["Due Date"],
                                dueWeek}
                        }
                    )
                    .reduce( (prev, curr) => { 
                        if (prev[curr.dueWeek] == null){
                            prev[curr.dueWeek] = {}
                        }
                            
                        prev[curr.dueWeek][curr.className] = {
                            assignmentTitle: curr["Assignment Title"], 
                            dueWeek: curr["Due Week"],
                            dueDate: curr.dueDate
                        }
                        

                        return prev
                    }, {})
    }


    const handleSelectWeek = (value) => {
        setCurrentWeek(value)
    }

    const weeks = () => {
        if (classAssignemnts === null) {
            return []
        }
        return Object.keys(configureClassAssignments(classAssignemnts))
    }
 
    return <>
        <h1>Weeklies for W/C {classAssignemnts && <SelectWeek weeks={weeks()} onChange={handleSelectWeek}/>}</h1> 
        
        
        {
                classAssignemnts !== null && 
                currentWeek && 
                <table>
                    <ClassAssignments classAssignemnts={configureClassAssignments(classAssignemnts)} currentWeek={currentWeek}/>
                </table>
        } 
        </>
}



const SelectWeek = ({weeks, onChange}) => {
    return <select onChange={(e) => onChange(e.target.value)}>
        {weeks && weeks.map(w => <option key={w} value={w}>{w}</option>)}
    </select>
}

const ClassAssignments = ({classAssignemnts, currentWeek}) => {

    if (classAssignemnts === null)
        return <pre></pre>

    return <>
        <tbody>
            {DeptClasses.map((dc, i) => <tr key={i}>
                <td>{dc}</td>
                <td>{classAssignemnts[currentWeek][dc] && classAssignemnts[currentWeek][dc]["assignmentTitle"]}</td>
                <td>{classAssignemnts[currentWeek][dc] && classAssignemnts[currentWeek][dc]["dueWeek"]}</td>
                <td>{classAssignemnts[currentWeek][dc] && classAssignemnts[currentWeek][dc]["dueDate"]}</td>
                
            </tr>)}
           
        </tbody>
    </>
}