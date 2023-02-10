const express = require('express');
const router = express.Router();
const{getAllPublicRoutines}=require('../db')

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
router.post('/', async(req,res,next)=>[
    console.log(req.body)
])
// PATCH /api/routines/:routineId

// DELETE /api/routines/:routineId

// POST /api/routines/:routineId/activities

module.exports = router;
