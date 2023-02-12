const express = require('express');
const router = express.Router();
const{getAllActivities,getPublicRoutinesByActivity,createActivity,getActivityByName, updateActivity, getActivityById}=require('../db')
const{requireUser}=require('./utils')
const{UserTakenError,PasswordTooShortError,UserDoesNotExistError,UnauthorizedError, ActivityExistsError,ActivityNotFoundError}=require('../errors');

// GET /api/activities/:activityId/routines
router.get('/:activityId/routines',async(req,res,next)=>{
    const{activityId}=req.params;
    const id = activityId
    // eslint-disable-next-line no-useless-catch
    try{
        const activities = await getPublicRoutinesByActivity({id})
        
            
        if(activities.length===0){
            res.send({
                error: 'ActivityError', name: '401', message: ActivityNotFoundError(id)
            })
        }
       
        res.send(activities)
        
    }catch({name,message}){
        next({name,message})
    }
    
  
})
   
// GET /api/activities
router.get('/',async(req,res,next)=>{
    try{
const allActivities = await getAllActivities()
res.send(allActivities)
    }catch({name,message}){
        next({name,message})
    }
})

// // POST /api/activities
router.post('/',async(req,res,next)=>{
    const{name,description}=req.body;
    const check = await getActivityByName(name);
    
    try{
       if(!req.headers.authorization){
        
        res.send({
            error: 'Unauthorized', name: '401', message: UnauthorizedError()
        })
       }if(check){
        res.send({
            error: 'ActivityExists', name: '401', message: ActivityExistsError(name)
        })
    }else{
       
const activities =await createActivity({name,description})

res.send(activities)}
       
    }catch({name,message}){
        next({name,message})
    }
    

})
// PATCH /api/activities/:activityId
router.patch('/:activityId', async (req, res, next) => {
    //Get parameters from the route
    const { activityId } = req.params;
    //Get parameters from the client
    const { name, description } = req.body;
    const id = activityId;
    //Get the activity by id to see if it exists
    const originalActivity = await getActivityById(id);
    //Get the acitvity by name to see if it exists
    const checkName = await getActivityByName(name);
    try {
                //If the user is logged in, the acitivity exists, and the name does not exist
                //update the activity
                if (req.headers.authorization && originalActivity && !checkName) {
                      const updatedActivity = await updateActivity({ id, name, description })
                      res.send(updatedActivity);
                }
          //If the activity does not exist send error
          if (!originalActivity) {
                res.status(401)
                res.send({
                      error: 'GetMeError', name: '401', message: `Activity ${id} not found`
                });
          }
          //If the name already exists in an acivity send error
          if (checkName) {
                res.status(402)
                res.send({
                      error:'GetMeError', name: '401', message: `An activity with name ${name} already exists`
                });
          }
    } catch ({ name, message }) {
          next({ name, message })
    }
});
module.exports = router;