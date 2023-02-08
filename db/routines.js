/* eslint-disable no-useless-catch */
const client = require("./client");
const { attachActivitiesToRoutines } = require("./activities");

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
    JOIN users ON routines."creatorId" = users.id
    `);

    return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    const data = await getAllRoutines();
    const filter = data.filter((routine) => {
      if (routine.isPublic) {
        return routine;
      }
    });
    return filter;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  // eslint-disable-next-line no-useless-catch
  try {
    const data = getAllRoutines();
    const newData = (await data).filter((routine) => {
      if (routine.creatorName === username) {
        return routine;
      }
    });
    const result = await attachActivitiesToRoutines(newData);

    return result;
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
    const { rows: routines } = await client.query(
      `
          SELECT routines.*, users.username AS "creatorName"
          FROM routines
          JOIN users ON routines."creatorId" = users.id
          JOIN routine_activities ON routines.id = routine_activities."routineId"
          WHERE routine_activities."activityId" = $1 AND routines."isPublic" = TRUE
          `,
      [id]
    );
    return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {
  const { isPublic, name, goal } = fields;
  // eslint-disable-next-line no-useless-catch
  try {
    if (!isPublic && !goal) {
      const {
        rows: [routine],
      } = await client.query(
        `
  UPDATE routines
  SET name=$1
  WHERE id=$2
  RETURNING *
  `,
        [name, id]
      );
      return routine;
    }
    if (!name && !goal) {
      const {
        rows: [routine],
      } = await client.query(
        `
  UPDATE routines
  SET "isPublic"=$1
  WHERE id=$2
  RETURNING *
  `,
        [isPublic, id]
      );
      return routine;
    }
    if (!goal && !isPublic) {
      const {
        rows: [routine],
      } = await client.query(
        `
  UPDATE routines
  SET name=$1
  WHERE id=$2
  RETURNING *
  `,
        [name, id]
      );
      return routine;
    } else {
      const {
        rows: [routine],
      } = await client.query(
        `
  UPDATE routines
  SET "isPublic"=$1,name=$2,goal=$3
  WHERE id=$4
  RETURNING *
  `,
        [isPublic, name, goal, id]
      );
      return routine;
    }
  } catch (error) {
    throw error;
  }
}

async function destroyRoutine(id) {
  try {
    await client.query(
      `
        DELETE FROM routine_activities 
        WHERE "routineId" = $1;
    `,
      [id]
    );
    const {
      rows: [routine],
    } = await client.query(
      `
        DELETE FROM routines 
        WHERE id = $1
        RETURNING *
    `,
      [id]
    );
    return routine;
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
