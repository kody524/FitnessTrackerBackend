const express = require('express');
const router = express.Router();
const{getAllActivities,getPublicRoutinesByActivity,createActivity}=require('../db')

// GET /api/activities/:activityId/routines
router.get('/:activityId/routines',async(req,res,next)=>{
    const{activityId}=req.params;
    // eslint-disable-next-line no-useless-catch
    try{
        const activities = await getPublicRoutinesByActivity(activityId)
        
        res.send(activities)
    }catch(error){
        throw error
    }
    
  
})
   
// GET /api/activities

// // POST /api/activities

// PATCH /api/activities/:activityId

module.exports = router;
