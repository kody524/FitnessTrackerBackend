/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
const { JWT_SECRET = "secret" } = process.env;
const jwt = require("jsonwebtoken");
const {
  createUser,
  getUser,
  getUserByUsername,
  getPublicRoutinesByUser,
  getAllRoutinesByUser,
} = require("../db");

const {
  UserTakenError,
  PasswordTooShortError,
  UserDoesNotExistError,
  UnauthorizedError,
} = require("../errors");

// POST /api/users/register
router.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  const message = "Thanks for joining";
  try {
    const _user = await getUserByUsername(username);
    if (!username || !password) {
      next({
        name: "MissingRequiredInfoError",
        message: "Please fill in the username and password",
      });
    }
    if (password.length < 8) {
      res.send({
        error: "Password is too short error",
        message: PasswordTooShortError(),
        name: "PasswordTooSHortError",
      });
    }
    if (_user) {
      res.send({
        error: `Username ${_user} already exists`,
        message: UserTakenError(_user.username),
        name: "UserAlreadyExistsError",
      });
    }
    const user = await createUser({ username, password });

    const token = jwt.sign({ id: user.id, username }, "neverTell");

    res.send({ message, token, user });
  } catch ({ name, message }) {
    next({ name, message });
  }
});
// router.post("/register", async (req, res, next) => {
//   const message = "Thanks for joining!";
//   const { username, password } = req.body;
//   const _user = await getUserByUsername(username);
//   try {
//     if (!username || !password) {
//       next({
//         name: "MissingRequiredInfoError",
//         message: "Please fill in username and password",
//       });
//     }

//     if (password.length < 8) {
//       res.send({
//         error: "Password is too short",
//         message: PasswordTooShortError(),
//         name: "PasswordTooShortError",
//       });
//     }

//     if (_user) {
//       res.send({
//         error: `Username ${_user} already exists`,
//         message: UserTakenError(_user.username),
//         name: "UserAlreadyExistsError",
//       });
//     }

//     const user = await createUser({ username, password });
//     const token = jwt.sign(
//       {
//         id: user.id,
//         username: user.username,
//       },
//       JWT_SECRET,
//       {
//         expiresIn: "1w",
//       }
//     );

//     res.send({ message, token, user });
//   } catch ({ name, message }) {
//     next({ name, message });
//   }
// });

// POST /api/users/login
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  const message = "you're logged in!";

  // request must have both
  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUserByUsername(username);
    //Check to see if user exists and password entered = existing user password
    if (user && user.password === password) {
      //Add token, attaching id and username
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
        },
        "neverTell"
      );
      const verify = jwt.verify(token, "neverTell");

      res.send({ user, message, token });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});
// router.post("/login", async (req, res, next) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     next({
//       name: "MissingCredentialsError",
//       message: "Please supply both a username and password",
//     });
//   }
//   try {
//     const user = await getUser({ username, password });
//     if (!user) {
//       next({
//         name: "IncorrectCredentialsError",
//         message: "Username or password is incorrect",
//       });
//       if (user && passwordsMatch) {
//         const token = jwt.sign(user, JWT_SECRET);
//         res.send({ token });
//   }
//     catch (error) {
//     console.log(error);
//     next(error);
//   }
// });

// GET /api/users/me
router.get("/me", async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const usertoken = req.headers.authorization;

      const split = usertoken.split(" ");
      const token = split[1];
      const verified = jwt.verify(token, "neverTell");

      res.send({
        id: verified.id,
        username: verified.username,
      });
    } else res.status(401);
    res.send({
      error: "UnauthorizedError",
      name: "401",
      message: UnauthorizedError(),
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});
// const requireUser = (req, res, next) => {
//   if (!req.user) {
//     res.status(401).send({
//       error: "UnauthorizedError",
//       name: "UnauthorizedError",
//       message: UnauthorizedError(),
//     });
//   }
//   next();
// };
// router.get("/me", requireUser, async (req, res, next) => {
//   try {
//     const user = await getUserByUsername(req.user.username);

//     if (user) {
//       const userRoutines = await getAllRoutinesByUser(user.username);
//       res.send(user, userRoutines);
//     }
//   } catch ({ name, message }) {
//     next({ name, message });
//   }
// });

// GET /api/users/:username/routines
router.get("/:username/routines", async (req, res, next) => {
  const { username } = req.params;
  try {
    if (req.params) {
      const routines = await getAllRoutinesByUser({ username });
      res.send(routines);
    }
    if (req.headers.authorization) {
      const usertoken = req.headers.authorization;
      const split = usertoken.split(" ");
      const token = split[1];
      const decoded = jwt.verify(token, "neverTell");
      const routines = await getAllRoutinesByUser(decoded);
      res.send(routines);
    } else {
      res.send({
        error: "UnauthorizedError",
        name: "401",
        message: UnauthorizedError(),
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});
// router.get("/:username/routines", async (req, res, next) => {
//   try {
//     const { username } = req.params;
//     const user = await getUserByUsername(username);
//     if (!user) {
//       next({
//         name: "NoUser",
//         message: `Error looking up user ${username}`,
//       });
//     } else if (req.user && user.id === req.user.id) {
//       const routines = await getAllRoutinesByUser({ username: username });
//       res.send(routines);
//     } else {
//       const routines = await getAllRoutinesByUser({ username: username });
//       res.send(routines);
//     }
//   } catch (error) {
//     next(error);
//   }
// });

module.exports = router;
