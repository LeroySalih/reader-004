

import { useState, useEffect } from "react"
import supabase from "../config/supabaseClient"
import spacetime from 'spacetime'
import DeptClasses from "../data/DeptClasses"

export default () => {

    const [classAssignemnts, setClassAssignments] = useState(null);
    const [currentWeek, setCurrentWeek] = useState(null);

    const getClassAsignments = async () => {
        const {data, error} = await supabase
                                    .rpc("getclassassignments")

        error && console.error(error)
        console.table(data)

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
                    .map(ca => ({...ca, assignmentTitle:ca["Assignment Title"], dueWeek: spacetime(ca["Due Date"]).weekStart("Sunday").nearest('week').format('{year}-{month-pad}-{date-pad}')}))
                    .reduce( (prev, curr) => { 
                        if (prev[curr.dueWeek] == null){
                            prev[curr.dueWeek] = {}
                        }
                            
                        prev[curr.dueWeek][curr.className] = {assignmentTitle: curr["Assignment Title"]}
                        
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
        <h1>Weeklies {currentWeek && `for ${currentWeek}`}</h1> 
        {classAssignemnts && <SelectWeek weeks={weeks()} onChange={handleSelectWeek}/>}
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
            </tr>)}
        </tbody>
    </>
}