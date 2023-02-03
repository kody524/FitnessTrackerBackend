const client = require("./client");
const { attachActivitiesToRoutines } = require('./activities')
const { getUserByUsername } = require('./users')
const util = require('./util');

async function createRoutine({ creatorId, isPublic, name, goal }) {
  // eslint-disable-next-line no-useless-catch
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
       INSERT INTO routines("creatorId","isPublic",name,goal)
       VALUES($1,$2,$3,$4)
       RETURNING *
       `,
      [creatorId, isPublic, name, goal]
    );
    return routine;
  } catch (error) {
    throw error;
  }
}

async function getRoutineById(id) {
  // eslint-disable-next-line no-useless-catch
  try {
    const { rows } = await client.query(`
     SELECT * FROM routines
     WHERE id=${id}
     ;`);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  // eslint-disable-next-line no-useless-catch
  try {
    const { rows } = await client.query(`
    SELECT * FROM routines;`);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutines() {
  // eslint-disable-next-line no-useless-catch
  try {
    const { rows: routines } = await client.query(`
    SELECT routines.*, users.username AS "creatorName" FROM routines
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    `);

    return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function getAllPublicRoutines() {
  // eslint-disable-next-line no-useless-catch
  try {
    const { rows } = await client.query(`
    SELECT * FROM routines
    WHERE "isPublic"=true;
    `);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  // eslint-disable-next-line no-useless-catch

  // eslint-disable-next-line no-useless-catch
  try {
    const { rows } = await client.query(`
    SELECT * FROM routines
    WHERE 
    ;
   
    `);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  // eslint-disable-next-line no-useless-catch
  try {
    const { rows } = await client.query(`
    SELECT * FROM routines 
    WHERE "isPublic"=true AND "creatorId"=${username.id}
    `);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  // eslint-disable-next-line no-useless-catch
  try {
    const { rows } = await client.query(`
  SELECT * FROM routines
  WHERE "activityId" IN routine_activities=${id}
  `);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {
//   // eslint-disable-next-line no-useless-catch
//   try {
//     let { name, description } = fields;
//     if (!) {
//       const {
//         rows: [routine],
//       } = await client.query(
//         `
//     UPDATE routines
//     SET description=$1
//     WHERE id=${id}
//     RETURNING *
//     `,
//         [description]
//       );
//       return routine;
//     } else {
//       const {
//         rows: [routine],
//       } = await client.query(
//         `
//     UPDATE routines
//     SET name=$1
//     WHERE id=${id}
//     RETURNING *
//     `,
//         [name]
//       );
//       return routine;
//     }
//   } catch (error) {
//     throw error;
//   }
// }

async function destroyRoutine(id) {}

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
