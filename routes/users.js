const User = require("../models/user")
const express = require("express")
const router = express.Router();
const jwt = require('jsonwebtoken');
const {jwt_secret} = require("../utils/config");
const {adminAuth} = require("../utils/auth");
const mailer = require("../utils/mailer");

router.post("/register", (req, res) => {
    const { name, email, password, role } = req.body;
    if (password.length < 8) {
        return res.status(400).json({ message: "Password less than 8 characters" })
    }
    const teamId = Math.floor(Math.random() * 1000000);
    User.create({
        name,
        email,
        password,
        role,
        teamId
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

router.put('/edit', (req, res) => {
  const {name,id} = req.body;
  User.findById(id).then(user=>{
        user.name = name;
        user.save().then(user =>
            res.status(200).json({message: "Name successfully changed", user})
        ).catch (err=>{
            res.status(400).json({message: "Name not successful changed", error: err.message,})
        });
  });
});

router.put('/change_password', (req, res) => {
  const {password,id} = req.body;
    User.findById(id).then(user=>{
            user.password = password;
            user.save().then(user =>
                res.status(200).json({message: "Password successfully changed", user})
            ).catch (err=>{
                res.status(400).json({message: "Password not successful changed", error: err.message,})
            });
    }).catch(err=>{
        res.status(400).json({message: "User not found", error: err.message});
    })
})

router.post("/invite-register", (req, res) => {
    const {name,password,token,email} = req.body;
    jwt.verify(token,jwt_secret,(err,decodedToken)=>{
        if(err){
            return res.status(400).json({message:"Invalid token"});
        }
        const {role,teamId} = decodedToken;
        console.log(name);
        User.create({
            name,
            password,
            email,
            role,
            teamId
        }).then(user => {
            res.status(200).json({
                message: "User successfully created",
                user,
            })
            const subject = "Welcome to AIM";
            const body = "You have been successfully added to a team on AIM. Kindly login to proceed.";
            mailer(email, subject, body).then(r =>console.log(r)).catch(err=>console.log(err));
        }).catch (err=>{
            res.status(401).json({
                message: "User not successful created",
                error: err.message,
            })
        })
    })
})

//TODO: Revisit after hosting frontend
router.post("/invite",adminAuth, (req, res) => {
    const {invites} = req.body;
    const failed = [];
    invites.forEach(invite=>{
        const {email,role,teamId} = invite;
        const token = jwt.sign({email,role,teamId}, jwt_secret);
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
                const token = jwt.sign({email, role: usr.role}, jwt_secret);
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

router.get("/all_users", (req, res) => {
    const teamId = req.query.teamId;
    User.find({teamId:teamId}).then(users => {
        res.status(200).json(users)
    })
});

router.get("/all_employees", (req, res) => {
    const teamId = req.query.teamId;
    User.find({ role: "Employee",teamId: teamId }).then(users => {
        res.status(200).json(users)
    })
});

router.get("/logout", (req, res) => {
    res.cookie("jwt", "", { maxAge: "1" })
    res.status(200).json({ message: "User successfully logged out" });
});

router.put("/change_role",adminAuth, (req, res) => {
    const {userId,role} = req.body;
    User.findById(userId).then(user=>{
        user.role = role;
        user.save().then(user =>
            res.status(200).json({message: "Role successfully changed", user})
        ).catch (err=>{
            res.status(400).json({message: "Role not successful changed", error: err.message,})
        })
    }).catch(err=>{
        res.status(400).json({message: "User not found", error: err.message,});
    })
})

router.post("/delete",adminAuth, (req, res) => {
    const {userId} = req.body;
    User.findByIdAndDelete(userId).then(user => {
        res.status(200).json({message: "User successfully deleted", user})
    }).catch(err=>{
        res.status(400).json({message: "User not successfully deleted", error: err.message});
    });
});

module.exports = router