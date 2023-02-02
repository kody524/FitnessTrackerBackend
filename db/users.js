const client = require('./client');
const util = require ('./util');


// database functions

// user functions
async function createUser({ username, password }) {

  // eslint-disable-next-line no-useless-catch
  try {
    const { rows: [user], } = await client.query(`
  INSERT INTO users(username,password)
  VALUES($1,$2)
  ON CONFLICT (username) DO NOTHING
  RETURNING username;
  `, [username, password]);

    return user
  } catch (error) {
    throw error;
  }
}

async function getUser({ username, password }) {
  // eslint-disable-next-line no-useless-catch
  try {
    const user = await getUserByUsername(username)

    if (user.password !== password) {
      return null
    } else {
      return {
        id: user.id,
        username: user.username
      }
    }

  } catch (error) {
    throw error
  }

}

async function getUserById(userId) {

  // eslint-disable-next-line no-useless-catch
  try {
    const { rows } = await client.query(`
SELECT * FROM users
WHERE id=$1
`, [userId])

    return rows
  } catch (error) {
    throw error
  }
}



async function getUserByUsername(userName) {
  try {
    const { rows } = await client.query(`
      SELECT *
      FROM users
      WHERE username = $1;
    `, [userName]);
    // if it doesn't exist, return null
    if (!rows || !rows.length) return null;
    // if it does:
    // delete the 'password' key from the returned object
    const [user] = rows;
    // delete user.password;
    return user;
  } catch (error) {
    console.error(error)
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
