/* eslint-disable no-useless-catch */
const express = require("express");
const dotenv = require('dotenv').config();
const router = express.Router();
const jwt= require('jsonwebtoken');
const{getUserByUsername,createUser,getPublicRoutinesByUser,getUser,getAllRoutinesByUser}=require('../db')
const{UserTakenError,PasswordTooShortError,UserDoesNotExistError,UnauthorizedError}=require('../errors')
const{JWT_SECRET="never tell"}=process.env
const { requireUser } = require('./utils');

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

     const token = jwt.sign({id:user.id, username:user.username},JWT_SECRET);
     
     res.send({message,token,user})
     
      
  }catch({name,message}){
      next({name,message})
  }})

// POST /api/users/login
router.post('/login',async(req,res,next)=>{
  const{username,password}=req.body;

  if(!username || !password){
    next({
      name:"MissingRequiredInfoError",
      message: "Please fill in username and password",
    })
  }
  try{
    const user = await getUser({username,password});
    if(user){
      const token = jwt.sign({
        id:user.id,
        username,
      },JWT_SECRET,{
        expiresIn:"1w",
      });
      res.send({message:"you're logged in!",user,token})
    }else{
      res.send(UserDoesNotExistError(user))
    }
  }catch({name,message}){
    next({name,message})
  }
})
// GET /api/users/me

// GET /api/users/:username/routines
router.get('/:username/routines', async(req,res,next)=>{
  const{username}=req.params;

  const routines = await getPublicRoutinesByUser({username})
  res.send(routines)
})
module.exports = router;