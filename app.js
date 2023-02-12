

const express = require("express");
const morgan = require("morgan");
const cors = require('cors')
const app = express();

// Setup your Middleware and API Router here
const apiRouter = require("./api");

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(morgan("dev"));
app.use(cors());
app.use("/api", apiRouter);

app.get("*", (req, res) => {
  res.status(404).send({
    error: "404 - not found",
    message: "No route found for the requested path",
  });
});

module.exports = app;