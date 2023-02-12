
const client = require("./client");
const{attachActivitiesToRoutines}=require('./activities')
async function createRoutine({ creatorId, isPublic, name, goal }) {
  // eslint-disable-next-line no-useless-catch
  try{

   const{rows:[routine]}= await client.query(`
    INSERT INTO routines("creatorId","isPublic",name,goal)
    VALUES($1, $2, $3, $4)
    RETURNING *;
    `,[creatorId,isPublic,name,goal])
    
    return routine
  }catch(error){
    throw error
  }
}



async function getRoutineById(id) {
  // eslint-disable-next-line no-useless-catch
  try{
    
   const{rows:[routine]}=await client.query(`
    SELECT * FROM routines
    WHERE id=$1
    ;`,[id])

    return routine
  }catch(error){
    throw error
  }
}

async function getRoutinesWithoutActivities() {
  // eslint-disable-next-line no-useless-catch
  try{
   const{rows} =await client.query(`
    SELECT * FROM routines;
    `)

    return rows
  }catch(error){
    throw error
  }

}

async function getAllRoutines() {
  // eslint-disable-next-line no-useless-catch
  try {
    const { rows: routines } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id 
    `);
    return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error
  }
}

async function getAllPublicRoutines() {
  // eslint-disable-next-line no-useless-catch
  try{
   const data = await getAllRoutines()
  const filter = data.filter(routine=>{
    if(routine.isPublic){
      return routine
    }
  })
  return filter
  }catch(error){
    throw error
  }
}

async function getAllRoutinesByUser({ username }) {
  // eslint-disable-next-line no-useless-catch
 
  // eslint-disable-next-line no-useless-catch
  try{
 const data = getAllRoutines()
 const newData =  (await data).filter(routine=>{
if(routine.creatorName===username){
  return routine
}
 })
 const result = await attachActivitiesToRoutines(newData)

 return result
  }catch(error){
    throw error
  }
}

async function getPublicRoutinesByUser({ username }) {
  // eslint-disable-next-line no-useless-catch
  try{
const data = await getAllRoutinesByUser({username})

const result = data.filter(routines=>{
  if(routines.isPublic){
    return routines
  }
})

return result
  }catch(error){
    throw error
  }
}

async function getPublicRoutinesByActivity({ id }) {
  // eslint-disable-next-line no-useless-catch
  try {
    const { rows: routines } = await client.query(`
        SELECT routines.*, users.username AS "creatorName"
        FROM routines
        JOIN users ON routines."creatorId" = users.id
        JOIN routine_activities ON routines.id = routine_activities."routineId"
        WHERE routine_activities."activityId" = $1 AND routines."isPublic" = TRUE
        `,[id]);
        
    return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${key}"=$${index + 1}
  `).join(', ');
  // eslint-disable-next-line no-useless-catch
  try {
    if (setString.length > 0) {
      const { rows: [routine] } = await client.query(`
            UPDATE routines
            SET ${setString}
            WHERE id=${id}
            RETURNING *;
            `, Object.values(fields));
      return routine;
    }
  } catch (error) {
    throw error;
  }
}


async function destroyRoutine(id) {
  // eslint-disable-next-line no-useless-catch
  try {
    await client.query(`
      DELETE FROM routine_activities
      WHERE "routineId" = $1;
      `, [id]);
    const { rows: routine } = await client.query(`
      DELETE FROM routines
      WHERE id = $1
      `, [id]);
    return routine
  
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
