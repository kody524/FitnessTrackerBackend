const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  // return the new activity
  // eslint-disable-next-line no-useless-catch
  try{
   const{rows:[activities]}= await client.query(`
    INSERT INTO activities (name,description)
    VALUES($1,$2)
    ON CONFLICT(name) DO NOTHING
    RETURNING *;
    `,[name,description])
    return activities
  }catch(error){
    throw error
  }
}

async function getAllActivities() {
  // select and return an array of all activities
  // eslint-disable-next-line no-useless-catch
  try{
    const{rows}=await client.query(`
    SELECT * FROM activities;
    `)
   
    return rows
  }catch(error){
    throw error
  }
}

async function getActivityById(id) {
// eslint-disable-next-line no-useless-catch
try{
  const{rows:[activity]}= await client.query(`
SELECT * FROM activities 
WHERE id=${id};  
  `)
  
  return activity
}catch(error){
  throw error
}

}
async function attachActivitiesToRoutines(routines) {
  // no side effects
  const routinesToReturn = [...routines];
  const binds = routines.map((_, index) => `$${index + 1}`).join(', ');
  const routineIds = routines.map(routine => routine.id);
  if (!routineIds?.length) return [];
  
  // eslint-disable-next-line no-useless-catch
  try {
    // get the activities, JOIN with routine_activities (so we can get a routineId), and only those that have those routine ids on the routine_activities join
    const { rows: activities } = await client.query(`
      SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities 
      JOIN routine_activities ON routine_activities."activityId" = activities.id
      WHERE routine_activities."routineId" IN (${ binds });
    `, routineIds);
    // loop over the routines
    for(const routine of routinesToReturn) {
      // filter the activities to only include those that have this routineId
      const activitiesToAdd = activities.filter(activity => activity.routineId === routine.id);
      // attach the activities to each single routine
      routine.activities = activitiesToAdd;
    }
    return routinesToReturn;
  } catch (error) {
    throw error;
  }
}

async function getActivityByName(name) {
  // eslint-disable-next-line no-useless-catch
  try{
    const{rows:[activity]}= await client.query(`
    SELECT * FROM activities 
    WHERE name='${name}'
    `)
    return activity
  }catch(error){
    throw error
  }
}



async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity
  // eslint-disable-next-line no-useless-catch
  try{
    let {name,description}=fields;
    if(!name){
      const{rows:[activity]}= await client.query(`
    UPDATE activities
    SET description=$1
    WHERE id=${id}
    RETURNING *
    `,[description])
    return activity
    }else if(!description){
      const{rows:[activity]}= await client.query(`
    UPDATE activities
    SET name=$1
    WHERE id=${id}
    RETURNING *
    `,[name])
    return activity
    }else{
      const{rows:[activity]}= await client.query(`
      UPDATE activities
      SET name=$1,description=$2
      WHERE id=${id}
      RETURNING *
      `,[name,description])
      return activity
    }
  }catch(error){
    throw error
  }


}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
