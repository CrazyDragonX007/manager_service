const express = require("express")
const cookieParser = require("cookie-parser");
const {port} = require("./utils/config");

const projectRouter = require('./routes/projects');
const taskRouter = require('./routes/tasks');
const shiftRouter = require('./routes/shifts');

const app = express()
app.use(express.json())
app.use(cookieParser())
const db = require("./utils/db")
db()

app.use('/projects', projectRouter);
app.use('/tasks', taskRouter);
app.use('/shifts', shiftRouter);

const server = app.listen(port, () => console.log(`Server Connected`))

process.on("unhandledRejection", err => {
    console.log(`An error occurred: ${err.message}`)
    server.close(() => process.exit(1))
})