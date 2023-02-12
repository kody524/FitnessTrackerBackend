/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
const jwt= require('jsonwebtoken');
const{requireUser}=require('./utils')
const{getUserByUsername,createUser,getPublicRoutinesByUser,getUser,getAllRoutinesByUser}=require('../db')
const{UserTakenError,PasswordTooShortError,UserDoesNotExistError,UnauthorizedError}=require('../errors');
const { de } = require("faker/lib/locales");



// POST /api/users/register
router.post('/register',async (req,res,next)=>{
  const{username,password}=req.body;
  const message = 'Thanks for joining';
  try{
     const _user = await getUserByUsername(username);
     if(!username || ! password){
      next({
        name:"MissingRequiredInfoError",
        message:"Please fill in the username and password",
      });
     }
     if(password.length< 8){
      res.send({
        error:"Password is too short error",
        message:PasswordTooShortError(),
        name:"PasswordTooSHortError",
      })
     }
     if(_user){
      res.send({
        error:`Username ${_user} already exists`,
        message: UserTakenError(_user.username),
        name:"UserAlreadyExistsError"
      })
     }
     const user = await createUser({username,password});

     const token = jwt.sign({id:user.id, username},"neverTell");
     
     res.send({message,token,user})
     
      
  }catch({name,message}){
      next({name,message})
  }})

// POST /api/users/login
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  const message = "you're logged in!";

  // request must have both
  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password"
    });
  }

  try {
    
    const user = await getUserByUsername(username);
    //Check to see if user exists and password entered = existing user password
    if (user && user.password === password) {
          //Add token, attaching id and username
          const token = jwt.sign({
                id: user.id,
               username: user.username
          },"neverTell");
        const verify = jwt.verify(token,"neverTell")
        
          
          res.send({ user,message,token});
    } else {
          next({
                name: 'IncorrectCredentialsError',
                message: 'Username or password is incorrect'
          });
    }
  }catch({name,message}){
    next({name,message})
  }
})


// GET /api/users/me
router.get('/me',async(req,res,next)=>{
  try{
if (req.headers.authorization) {
  const usertoken = req.headers.authorization;
 
  const split = usertoken.split(' ');
  const token = split[1];
  const verified = jwt.verify(token,"neverTell")
 
  res.send({
    id: verified.id, username: verified.username
});
  } else
  res.status(401)
  res.send({
    error: 'UnauthorizedError', name: '401', message: UnauthorizedError()
})
  }catch({name,message}){
    next({name,message})
}})

// GET /api/users/:username/routines
router.get('/:username/routines', async(req,res,next)=>{
  const{username}=req.params
  const getUser = await getUserByUsername(username)
  try{
      const usertoken = req.headers.authorization;
      const split = usertoken.split(' ');
      const token = split[1];
      const decoded = jwt.verify(token,"neverTell")
      if(!username) { 
        next({
          name: 'No User',
          message: `Error looking up user ${username}`
        });
      } else if(decoded.username && getUser.id === decoded.id) {
        const routines = await getAllRoutinesByUser({username: username});
        res.send(routines);
      } else {
        const routines = await getPublicRoutinesByUser({username: username});
        res.send(routines);
      }
    
      
      
    
    
  }catch({name,message}){
    next({name,message})
}

})
module.exports = router;

