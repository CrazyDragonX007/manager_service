const express = require("express");
const https = require("https");
const cookieParser = require("cookie-parser");
const logger = require('morgan');
const cors = require('cors');
const socket = require("socket.io");
const {port,frontend_url} = require("./utils/config");
const db = require("./utils/db");

const usersRouter = require('./routes/users');
const projectRouter = require('./routes/projects');
const taskRouter = require('./routes/tasks');
const shiftRouter = require('./routes/shifts');
const sectionRouter = require('./routes/sections');
const messageRouter = require('./routes/messages');

const corsOptions = {
    origin: frontend_url,
    optionsSuccessStatus: 200
}

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
app.use('/messages',messageRouter);

// const server = app.listen(port, () => console.log(`Server Connected`))
const server = https.createServer(app).listen(port, () => console.log(`Server Connected`))

global.onlineUsers = new Map();

const io = socket(server, {
    cors: {
        origin: frontend_url
    },
});
io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-receive", data);
        }
    });
});

process.on("unhandledRejection", err => {
    console.log(`An error occurred: ${err.message}`)
    server.close(() => process.exit(1))
});