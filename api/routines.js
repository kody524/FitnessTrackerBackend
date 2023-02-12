const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getAllPublicRoutines, createRoutine, getAllRoutinesByUser, updateRoutine, getRoutineById, destroyRoutine, attachActivitiesToRoutines } = require('../db')

const {
    UnauthorizedError,
    UnauthorizedDeleteError,
    UnauthorizedUpdateError,
    DuplicateRoutineActivityError,
} = require("../errors");

// GET /api/routines
router.get('/', async (req, res, next) => {
    // eslint-disable-next-line no-useless-catch
    try {
        const routines = await getAllPublicRoutines();
        res.send(routines)
    } catch ({ name, message }) {
        next({ name, message })
    }
})
// POST /api/routines
router.post('/', async (req, res, next) => {
    const { isPublic, name, goal } = req.body
    try {
        if (req.headers.authorization) {
            const usertoken = req.headers.authorization;
            const token = usertoken.split(' ');
            const decoded = jwt.verify(token[1], "neverTell");
            const { id } = decoded
            const creatorId = id

            const create = await createRoutine({ creatorId, isPublic, name, goal })

            res.send(create)
        } else {
            res.send({
                error: 'UnauthorizedError', name: '401', message: UnauthorizedError()
            })
        }


    } catch ({ name, message }) {
        next({ name, message })
    }



})
// PATCH /api/routines/:routineId
router.patch('/:routineId', async (req, res, next) => {
    const { isPublic, name, goal } = req.body;
    const { routineId } = req.params;
    try {
        if (req.headers.authorization) {
            const usertoken = req.headers.authorization;
            const token = usertoken.split(' ');
            const decoded = jwt.verify(token[1], "neverTell");
            const { id, username } = decoded

            const routines = await getRoutineById(routineId)
            if (id !== routines[0].creatorId) {
                res.status(403)
                res.send({
                    error: 'UnauthorizedError', name: '401', message: UnauthorizedUpdateError(username, routines[0].name)
                })
            }
            const update = await updateRoutine({ id, isPublic, name, goal })

            res.send(update)

        } else {
            res.send({
                error: 'UnauthorizedError', name: '401', message: UnauthorizedError()
            })
        }

    } catch ({ name, message }) {
        next({ name, message })
    }

})
// DELETE /api/routines/:routineId
router.delete('/:routineId', async (req, res, next) => {
    const { routineId } = req.params;

    try {
        if (req.headers.authorization) {
            const usertoken = req.headers.authorization;
            const token = usertoken.split(' ');
            const decoded = jwt.verify(token[1], "neverTell");
            const { id, username } = decoded
            const originalRoutine = await getRoutineById(routineId);
            const creatorId = originalRoutine[0].creatorId;

            if (id === creatorId) {
                const trash = await destroyRoutine(id);

                res.send(originalRoutine)
            } else
                res.status(403)
            res.send({
                error: 'UnauthorizedError', name: '401', message: UnauthorizedDeleteError(username, originalRoutine[0].name)
            })
        }

    } catch ({ name, message }) {
        next({ name, message })
    }

})
// POST /api/routines/:routineId/activities
router.post('/:routineId/activities', async (req, res, next) => {
    const { routineId } = req.params;
    try {
        const routines = await getRoutineById(routineId)
        //attatch


        const attach = await attachActivitiesToRoutines(routines)

        res.send(attach[0].activities)
    } catch ({ name, message }) {
        next(name, message)
    }
})
module.exports = router;