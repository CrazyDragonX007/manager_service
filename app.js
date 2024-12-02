const express = require("express");
const https = require("https");
const http = require("http");
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
const bodyParser = require("body-parser");
const {readFileSync} = require("node:fs");

const corsOptions = {
    origin: frontend_url,
    optionsSuccessStatus: 200
}

let sslOptions = {
    key: readFileSync('server-key.pem'),
    cert: readFileSync('server-cert.pem')
};

const app = express()

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', frontend_url);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header(
        'Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-Api-Key'
    );
    res.header('Access-Control-Allow-Credentials', 'true');
    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    }
    else {
        next();
    }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser())
app.use(logger('dev'));
app.use(cors(corsOptions));
db()

app.use('/users', usersRouter);
app.use('/projects', projectRouter);
app.use('/tasks', taskRouter);
app.use('/shifts', shiftRouter);
app.use('/sections',sectionRouter);
app.use('/messages',messageRouter);
app.use('/test', (req,res)=>res.send("Welcome to AIM API"));

// const server = app.listen(port, () => console.log(`Server Connected`))
const httpsServer = https.createServer(sslOptions,app).listen(port, () => console.log(`Server Connected`));
// http.createServer(app).listen(port, () => console.log(`Server Connected`));

const server = httpsServer;

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