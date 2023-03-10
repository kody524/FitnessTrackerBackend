

const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {

// eslint-disable-next-line no-useless-catch
try{
  const {rows: [user]}= await client.query(`
  INSERT INTO users(username,password)
  VALUES($1,$2)
  ON CONFLICT (username) DO NOTHING
  RETURNING id, username;
  `,[username,password]);

  return user
}catch(error){
  throw error;
}
}

async function getUser({ username, password }) {
// eslint-disable-next-line no-useless-catch
try{
 const user= await getUserByUsername(username)

if(user.password!==password){
  return null
}else{
  return {
    id:user.id,
    username:user.username
  }
}

}catch(error){
  throw error
}

}

async function getUserById(userId) {
  
// eslint-disable-next-line no-useless-catch
try{

const{rows:[user]}= await client.query(`
SELECT id,username FROM users
WHERE id=$1

`,[userId])

return user
}catch(error){
  throw error
}
}

async function getUserByUsername(userName) {
// eslint-disable-next-line no-useless-catch
try{
  
const{rows:[user]}= await client.query(`
SELECT * FROM users 
WHERE username='${userName}'
`)
return user;
}catch(error){
  throw error
}
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
