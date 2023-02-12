const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const{canEditRoutineActivity,updateRoutineActivity, getRoutineActivityById, getRoutineById, destroyRoutineActivity}=require('../db')
const{UserTakenError,PasswordTooShortError,UserDoesNotExistError,UnauthorizedError, ActivityExistsError,ActivityNotFoundError,UnauthorizedUpdateError,UnauthorizedDeleteError}=require('../errors');
// PATCH /api/routine_activities/:routineActivityId
router.patch('/:routineActivityId',async(req,res,next)=>{
    const{count,duration}=req.body
    const{routineActivityId}=req.params;
    const ID = routineActivityId
    
    try{
        if(req.headers.authorization){
            const usertoken = req.headers.authorization;
            const token = usertoken.split(' ');
            const decoded = jwt.verify(token[1], "neverTell");
            const{id,username}=decoded
            const canEdit = await canEditRoutineActivity(routineActivityId,id)
            if(canEdit){
                const updated = await updateRoutineActivity({id:ID,count:count,duration:duration})
             
                res.send(updated)
            }else{
                const original = await getRoutineActivityById(ID)
                const routine = await getRoutineById(original.routineId)
                res.send({
                    error: 'UnauthorizedError', name: '401', message: UnauthorizedUpdateError(username,routine[0].name)
                })
            }
        }
        res.send({
            error: 'UnauthorizedError', name: '401', message: UnauthorizedError()
        })
    }catch({name,message}){
        next({name,message})
    }
})
// DELETE /api/routine_activities/:routineActivityId
router.delete('/:routineActivityId',async(req,res,next)=>{
    const{routineActivityId}=req.params;
    const ID = routineActivityId
    try{
        if(req.headers.authorization){
            const usertoken = req.headers.authorization;
            const token = usertoken.split(' ');
            const decoded = jwt.verify(token[1], "neverTell");
            const{id,username}=decoded
            const original = await getRoutineActivityById(ID)
            const canEdit = await canEditRoutineActivity(ID,id)
            if(canEdit){
                const trash = await destroyRoutineActivity(ID)
                res.send(trash)
            }else{
                const routine = await getRoutineById(original.routineId)
                res.status(403)
                res.send({
                    error: 'UnauthorizedError', name: '401', message: UnauthorizedDeleteError(username,routine[0].name)
                }) 
            }
        }
    }catch({name,message}){
        next({name,message})
    }
})
module.exports = router;
