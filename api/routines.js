const express = require('express');
const { tr } = require('faker/lib/locales');
const router = express.Router();
const jwt = require('jsonwebtoken');
const{getAllPublicRoutines, createRoutine, getAllRoutinesByUser, updateRoutine, getRoutineById, destroyRoutine,attachActivitiesToRoutines, getRoutineActivitiesByRoutine, addActivityToRoutine}=require('../db')

const{UserTakenError,PasswordTooShortError,UserDoesNotExistError,UnauthorizedError, ActivityExistsError,ActivityNotFoundError,UnauthorizedUpdateError,UnauthorizedDeleteError}=require('../errors');

// GET /api/routines
router.get('/', async(req,res,next)=>{
// eslint-disable-next-line no-useless-catch
try{
const routines = await getAllPublicRoutines();
res.send(routines)
} catch ({ name, message }) {
    next({ name, message })
  } 
})
// POST /api/routines
router.post('/', async(req,res,next)=>{
  const{isPublic,name,goal}=req.body
  try{
    if(req.headers.authorization){
      const usertoken = req.headers.authorization;
      const token = usertoken.split(' ');
      const decoded = jwt.verify(token[1], "neverTell");
      const{id}=decoded
      const creatorId = id
     
      const create = await createRoutine({creatorId,isPublic,name,goal})
   
      res.send(create)
    }else{
      res.send({
        error: 'UnauthorizedError', name: '401', message: UnauthorizedError()
    })
    }
   

  }catch({name,message}){
    next({name,message})
  }
  

  
})
// PATCH /api/routines/:routineId
router.patch('/:routineId',async(req,res,next)=>{
  const{isPublic,name,goal}=req.body;
  const {routineId}=req.params;
 const id = routineId
  try{
    if(req.headers.authorization){
      const usertoken = req.headers.authorization;
      const token = usertoken.split(' ');
      const decoded = jwt.verify(token[1], "neverTell");
      const username= decoded.username
      const userId = decoded.id
      const routines = await getRoutineById(routineId)
    if(userId!==routines.creatorId){
      res.status(403)
      res.send({
        error: 'UnauthorizedError', name: '401', message: UnauthorizedUpdateError(username,routines.name)
    })
    }
     const update = await updateRoutine({id,isPublic,name,goal})

     res.send(update)
     
    }else {
      res.send({
        error: 'UnauthorizedError', name: '401', message: UnauthorizedError()
    })
    }
    
  }catch({name,message}){
    next({name,message})
  }
 
})
// DELETE /api/routines/:routineId
router.delete('/:routineId', async (req, res, next) => {
  const { routineId } = req.params;
  const id = routineId;
  try {
        //If user not logged in send error
        if (!req.headers.authorization) {
              res.status(401)
              res.send({
                    error: 'GetMeError', name: '401', message: 'You must be logged in to perform this action'
              });
        }
        //Find creatorId of the routine that is getting deleted
        const originalRoutine = await getRoutineById(id);
        const creatorId = originalRoutine.creatorId;
        //Decode the token to see if logged in user is the routine creator
        const usertoken = req.headers.authorization;
        const token = usertoken.split(' ');
        const decoded = jwt.verify(token[1], "neverTell");
        //If the token id matches the creatorId, allow the routine to get deleted
        if (decoded.id === creatorId) {
              const destroyedRoutine = await destroyRoutine(id);
              //console.log(destroyedRoutine);
              res.send(originalRoutine);
        } else {
              //If user is not the routine creator send errror
              res.status(403)
              res.send({
                    error: 'GetMeError', name: '403', message: 'User ' + decoded.username + ' is not allowed to delete ' + originalRoutine.name,
              });
        }
  } catch ({ name, message }) {
        next({ name, message })
  }
});
// POST /api/routines/:routineId/activities
router.post('/:routineId/activities', async (req, res, next) => {
  const { routineId } = req.params;
  const { activityId, count, duration, } = req.body;
  const id = routineId;
  //Get the current activities at the routineId, destructure since
  //getRoutineActivitiesByRoutine returns an object and
  //needs to test if originalRoutineActivities is undefined, not if it is
  //an empty array
  const [originalRoutineActivities] = await getRoutineActivitiesByRoutine({ id });
  try {
        //If the activity being added does not exist, add to routine_activities
        //if not send error
        if (!originalRoutineActivities) {
              const addActToActRoutines = await addActivityToRoutine({
                    routineId,
                    activityId,
                    count,
                    duration,
              });
              res.send(addActToActRoutines);
        } else {
              res.status(403)
              res.send({
                    error: 'GetMeError', name: '403', message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
              });
        }
  } catch ({ name, message }) {
        next({ name, message })
  }
});
module.exports = router;
