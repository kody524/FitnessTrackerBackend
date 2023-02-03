const client = require("./client");

// database functions
async function createActivity({ name, description }) {
  // return the new activity
  // eslint-disable-next-line no-useless-catch
  try {
    const {
      rows: [activities],
    } = await client.query(
      `
     INSERT INTO activities (name,description)
     VALUES($1,$2)
     ON CONFLICT(name) DO NOTHING
     RETURNING *;
     `,
      [name, description]
    );
    return activities;
  } catch (error) {
    throw error;
  }
}

async function getAllActivities() {
  // select and return an array of all activities
  // eslint-disable-next-line no-useless-catch
  try {
    const { rows } = await client.query(`
    SELECT * FROM activities;
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getActivityById(id) {
  // eslint-disable-next-line no-useless-catch
  try {
    const {
      rows: [activity],
    } = await client.query(`
SELECT * FROM activities 
WHERE id=${id};  
  `);

    return activity;
  } catch (error) {
    throw error;
  }
}

async function getActivityByName(name) {
  // eslint-disable-next-line no-useless-catch
  try {
    const {
      rows: [activity],
    } = await client.query(`
    SELECT * FROM activities 
    WHERE name='${name}'
    `);
    return activity;
  } catch (error) {
    throw error;
  }
}

async function attachActivitiesToRoutines(routines) {
  // select and return an array of all activities
  try {
    const 
  }
}

async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity
  // eslint-disable-next-line no-useless-catch
  try {
    let { name, description } = fields;
    if (!name) {
      const {
        rows: [activity],
      } = await client.query(
        `
    UPDATE activities
    SET description=$1
    WHERE id=${id}
    RETURNING *
    `,
        [description]
      );
      return activity;
    } else {
      const {
        rows: [activity],
      } = await client.query(
        `
    UPDATE activities
    SET name=$1
    WHERE id=${id}
    RETURNING *
    `,
        [name]
      );
      return activity;
    }
  } catch (error) {
    throw error;
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
