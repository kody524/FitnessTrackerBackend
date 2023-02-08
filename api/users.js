/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
const{ createUser,
    getUser,
    getUserById,
    getUserByUsername}=require('../db')

// POST /api/users/register
router.post('/register',async (req,res,next)=>{
const{username,password}=req.body;
try{
    if(!username || !password){
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and password"
          });
    }
    const create = await createUser(username,password)

}catch(error){
    throw error
}
// POST /api/users/register

// POST /api/users/login

// GET /api/users/me

// GET /api/users/:username/routines

module.exports = router;