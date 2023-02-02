const client = require("./client");
const util = require ('./util');

async function getRoutineActivityById(id) {
  // eslint-disable-next-line no-useless-catch
  try {
    const {rows: [routineActivity]} = await client.query (`
      SELECT * FROM routine_activities
      WHERE id = $1
    `, [id]);
    return routineActivity;

  } catch (error) {
    throw error;
  }
}

async function getRoutineActivitiesByRoutine ({id}) {
  // eslint-disable-next-line no-useless-catch
  try {
    const {rows} = await client.query (`
    SELECT * FROM routine_activites
    WHERE "routineId" = ${id}
    `);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  // eslint-disable-next-line no-useless-catch
  try {
  const {rows: [routineActivity]} = await client.query (`
    INSERT INTO routine_activites ("routineId", "activityId", count, duration)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT ("routineId, " acitivtyId) DO NOTHING
    RETURNING *;
  `, [routineId, activityId, count, duration]);
  return routineActivity;
} catch (error) {
  throw error;
  }
}

// eslint-disable-next-line no-unused-vars
async function getAllRoutineActivities() {
  // eslint-disable-next-line no-useless-catch
  try {
    const {rows} = await client.query (`
      SELECT * FROM routine_activites;
    `);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  // eslint-disable-next-line no-useless-catch
  try {
    const toUpdate = {}
    for (let column in fields) {
      if (fields[column] !== undefined) toUpdate[column] = fields[column];
    }
    let routineActivity;
    if (util.dbFields(fields).insert.length > 0) {
      const { rows } = await client.query(`
        UPDATE routine_activities
        SET ${util.dbFields(toUpdate).insert}
        WHERE id = ${id}
        RETURNING *;
      `, Object.values(toUpdate));
      routineActivity = rows[0];
      return routineActivity;
    }
  } catch (error) {
    throw error;
  }
}

  async function destroyRoutineActivity(id) {
    // eslint-disable-next-line no-useless-catch
    try {
      const { rows: [activity] } = await client.query(`
    DELETE FROM routine_activities 
    WHERE id=$1
    RETURNING *
    `, [id])

      return activity
    } catch (error) {
      throw error
    }
  }

async function canEditRoutineActivity(routineActivityId, userId) {
  const { rows: [routineFromRoutineActivity] } = await client.query(`
      SELECT * FROM routine_activities
      JOIN routines ON routine_activities."routineId" = routines.id
      AND routine_activities.id = $1
    `, [routineActivityId]);
  return routineFromRoutineActivity.creatorId === userId;
}


module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
