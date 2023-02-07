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

})
// POST /api/users/login
router.post('/login',async (rq,res,next)=>{

})
// GET /api/users/me
router.get('/me',(req,res,next)=>{

})
// GET /api/users/:username/routines
router.get('/:username/routines',(req,res,next)=>{
    
})
module.exports = router;
