const express = require("express")
const cookieParser = require("cookie-parser");
const logger = require('morgan');
const cors = require('cors');
const {port} = require("./utils/config");
const db = require("./utils/db");

const usersRouter = require('./routes/users');
const projectRouter = require('./routes/projects');
const taskRouter = require('./routes/tasks');
const shiftRouter = require('./routes/shifts');
const sectionRouter = require('./routes/sections');

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(logger('dev'));
app.use(cors());
db()

app.use('/users', usersRouter);
app.use('/projects', projectRouter);
app.use('/tasks', taskRouter);
app.use('/shifts', shiftRouter);
app.use('/sections',sectionRouter);

const server = app.listen(port, () => console.log(`Server Connected`))

process.on("unhandledRejection", err => {
    console.log(`An error occurred: ${err.message}`)
    server.close(() => process.exit(1))
})