/* eslint-disable no-useless-catch */
const client = require('./client');
const util = require('./util');

async function getRoutineActivityById(id) {
  try {
    const { rows: [routineActivity] } = await client.query(`
      SELECT * FROM routine_activities
      WHERE id = $1
    `, [id]);
    return routineActivity;
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
  try {
    const { rows: [routineActivity] } = await client.query(`
    INSERT INTO routine_activities ( "routineId", "activityId", count , duration)
    VALUES($1, $2, $3, $4)
    ON CONFLICT ("routineId", "activityId") DO NOTHING
    RETURNING *;
      `, [routineId, activityId, count, duration]);
    return routineActivity;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutineActivities() {
  try {
    const { rows } = await client.query(`
      SELECT * FROM routine_activities;
    `);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM routine_activities
      WHERE "routineId" = ${id}
    `);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {
  try {
    const toUpdate = {}
    for (let column in fields) {
      if (fields[column] !== undefined) toUpdate[column] = fields[column];
    }
    let routine;
    if (util.dbFields(fields).insert.length > 0) {
      const { rows } = await client.query(`
          UPDATE routines 
          SET ${util.dbFields(toUpdate).insert}
          WHERE id=${id}
          RETURNING *;
      `, Object.values(toUpdate));
      routine = rows[0];
      return routine;
    }
  } catch (error) {
    throw error;
  }
}
async function updateRoutineActivity({ id, ...fields }) {
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
  try {
    const { rows: [routineActivity] } = await client.query(`
        DELETE FROM routine_activities 
        WHERE id = $1
        RETURNING *;
    `, [id]);
    return routineActivity;
  } catch (error) {
    throw error;
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
  getAllRoutineActivities,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};