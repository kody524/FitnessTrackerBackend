const express = require('express');
const router = express.Router();
const { getAllActivities, getActivityById, getActivityByName, createActivity, updateActivity, getPublicRoutinesByActivity } = require('../db');
const { requireUser, requiredNotSent } = require('./utils')

// GET /api/activities/:activityId/routines
router.get('/:activityId/routines', async (req, res, next) => {
    try {
        const routines = await getPublicRoutinesByActivity({ id: req.params.activityId });
        if (routines) {
            res.send(routines);
        } else {
            next({
                name: 'NotFound',
                message: `No Routines found for Activity ${req.params.activityId}`
            })
        }
    } catch (error) {
        next(error);
    }
});

// GET /api/activities
router.get('/', async (req, res, next) => {
    try {
        const activities = await getAllActivities();
        res.send(activities);
    } catch (error) {
        next(error)
    }
})

// POST /api/activities
router.post('/', requireUser, requiredNotSent({ requiredParams: ['name', 'description'] }), async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const existingActivity = await getActivityByName(name);
        if (existingActivity) {
            next({
                name: 'NotFound',
                message: `An activity with name ${name} already exists`
            });
        } else {
            const createdActivity = await createActivity({ name, description });
            if (createdActivity) {
                res.send(createdActivity);
            } else {
                next({
                    name: 'FailedToCreate',
                    message: 'There was an error creating your activity'
                })
            }
        }
    } catch (error) {
        next(error);
    }
});

// PATCH /api/activities/:activityId
router.patch('/:activityId', requireUser, requiredNotSent({ requiredParams: ['name', 'description'], atLeastOne: true }), async (req, res, next) => {
    try {
        const { activityId } = req.params;
        const existingActivity = await getActivityById(activityId);
        console.log('existingActivity: ', existingActivity);
        if (!existingActivity) {
            next({
                name: 'NotFound',
                message: `No activity by ID ${activityId}`
            });
        } else {
            const { name, description } = req.body;
            const updatedActivity = await updateActivity({ id: activityId, name, description })
            if (updatedActivity) {
                res.send(updatedActivity);
            } else {
                next({
                    name: 'FailedToUpdate',
                    message: 'There was an error updating your activity'
                })
            }
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;