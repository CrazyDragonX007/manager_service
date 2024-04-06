const User = require("../models/User")
const express = require("express")
const router = express.Router();
const jwt = require('jsonwebtoken');
const {jwt_secret} = require("../utils/config");
const {adminAuth, managerOrAdminAuth} = require("../utils/auth");
const mailer = require("../utils/mailer");

router.post("/register", (req, res) => {
    const { name, email, password, role } = req.body;
    if (password.length < 8) {
        return res.status(400).json({ message: "Password less than 8 characters" })
    }
    User.create({
        name,
        email,
        password,
        role
    }).then(user => {
        res.status(200).json({
            message: "User successfully created",
            user,
        })
        const subject = "Welcome to AIM";
        const body = "You have been successfully registered as a user on AIM. Kindly login to proceed.";
        mailer(email, subject, body).then(r =>console.log(r)).catch(err=>console.log(err));
        }
    ).catch (err=>{
            res.status(401).json({
                message: "User not successful created",
                error: err.message,
            })
    })
});

//TODO: Revisit after making frontend
router.post("/invite",adminAuth, (req, res) => {
    const {invites} = req.body;
    const failed = [];
    invites.forEach(invite=>{
        const {email,role} = invite;
        const token = jwt.sign({email,role}, jwt_secret);
        const subject = "Invitation to join the team";
        const body = `You have been invited to join the team as a ${role}. Please click on the link to register: http://localhost:3000/invite/${token}`;
        const mail_sent = mailer(email,subject,body);
        if(!mail_sent){
            failed.push(email);
        }
    });
    if(failed.length>0) {
        res.status(400).json({message: "Some emails not sent", failed});
    }else{
        res.status(200).json({message: "All emails sent"});
    }
});

router.post("/login", (req, res) => {
    const { email, password } = req.body
    // Check if username and password is provided
    if (!email || !password) {
        return res.status(400).json({
            message: "Email or Password not present",
        })
    }
    const user = User.findOne({ email }).then(usr=>{
        if(!usr){
            return res.status(400).json({
                message: "User not found",
            })
        }
        usr.comparePassword(password,(err,isMatch)=>{
            if(err){console.log(err)}
            if(isMatch){
                const token = jwt.sign(
                    {email, role: usr.role},
                    jwt_secret
                );
                res.status(200).json({
                    message: "User successfully logged in",
                    token:token,
                    user:usr
                })
            }else{
                return res.status(400).json({
                    message: "Password is incorrect",
                })
            }
        });
    });
});

router.get("/all_users",adminAuth, (req, res) => {
    User.find({}).then(users => {
        res.status(200).json(users)
    })
});

router.get("/all_employees",managerOrAdminAuth, (req, res) => {
    User.find({ role: "Employee" }).then(users => {
        res.status(200).json(users)
    })
});

router.get("/logout", (req, res) => {
    res.cookie("jwt", "", { maxAge: "1" })
    res.status(200).json({ message: "User successfully logged out" });
});

module.exports = router