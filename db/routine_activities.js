const client = require("./client");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  
  // eslint-disable-next-line no-useless-catch
  try{
   const{rows:[activities]} =await client.query(`
    INSERT INTO routine_activities("routineId","activityId",count,duration)
    VALUES($1,$2,$3,$4)
    RETURNING *
    `,[routineId,activityId,count,duration]);
    
    return activities
  }catch(error){
    throw error
  }
}

async function getRoutineActivityById(id) {
  // eslint-disable-next-line no-useless-catch
  try{
    const{rows:[activity]}= await client.query(`
    SELECT * FROM routine_activities
    WHERE id=$1
    `,[id])
    return activity
  }catch(error){
    throw error
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  // eslint-disable-next-line no-useless-catch
  try{
    
    const {rows}= await client.query(`
    SELECT * FROM routine_activities
    WHERE "routineId"=$1
    `,[id])
  
    return rows
  }catch(error){
    throw error
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  // eslint-disable-next-line no-useless-catch
  try{
    
  let {count, duration}= fields
const {rows:[activity]}= await client.query(`
UPDATE routine_activities
SET count=$1,duration=$2
WHERE id=$3
RETURNING *
`,[count,duration,id])
return activity
  }catch(error){
    throw error
  }
}

async function destroyRoutineActivity(id) {
  // eslint-disable-next-line no-useless-catch
  try{
    const {rows:[activity]}= await client.query(`
    DELETE FROM routine_activities 
    WHERE id=$1
    RETURNING *
    `,[id])
   
    return activity
  }catch(error){
    throw error
  }
 
}

async function canEditRoutineActivity(routineActivityId, userId) {
  // eslint-disable-next-line no-useless-catch
  try{
    const{rows}= await client.query(`
    SELECT * FROM routine_activity
    WHERE id=$1 AND 
    `)
  }catch(error){
    throw error
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
