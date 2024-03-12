const User = require("../models/User")
const express = require("express")
const router = express.Router();
const jwt = require('jsonwebtoken');
const {jwt_secret} = require("../utils/config");
const {adminAuth, managerOrAdminAuth} = require("../utils/auth");

router.post("/register",adminAuth, (req, res) => {
    const { email, password, role } = req.body;
    if (password.length < 8) {
        return res.status(400).json({ message: "Password less than 8 characters" })
    }
    User.create({
        email,
        password,
        role
    }).then(user =>
        res.status(200).json({
            message: "User successfully created",
            user,
        })
    )
        .catch (err=>{
            res.status(401).json({
                message: "User not successful created",
                error: err.message,
            })
        })
});

router.post("/invite",adminAuth, (req, res) => {
    const {emails} = req.body;
    emails.forEach(e=>{
        // Send email to e?
    })
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
                    { id: user._id, email, role: usr.role },
                    jwt_secret
                );
                res.cookie("jwt", token, {
                    httpOnly: true,
                });
                res.status(200).json({
                    message: "User successfully logged in",
                })
            }else{
                return res.status(400).json({
                    message: "Password is incorrect",
                })
            }
        });
    })
})

router.get("/all_users",adminAuth, (req, res) => {
    User.find({}).then(users => {
        res.status(200).json(users)
    })
})

router.get("/all_employees",managerOrAdminAuth, (req, res) => {
    User.find({ role: "Employee" }).then(users => {
        res.status(200).json(users)
    })
})

router.get("/logout", (req, res) => {
    res.cookie("jwt", "", { maxAge: "1" })
    res.status(200).json({ message: "User successfully logged out" });
})

module.exports = router