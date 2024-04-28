const project = require("../models/project");
const express = require("express")
const router = express.Router();
const {adminAuth, managerOrAdminAuth} = require("../utils/auth");
const task = require("../models/task");
const section = require("../models/section");

router.post("/create", (req, res) => {
    const {title,description,createdBy,assignedManagers,assignedEmployees,teamId} = req.body;
    console.log(req.body);
    project.create({
            title,
            description,
            createdBy,
            assignedManagers,
            assignedEmployees,
            teamId
    }).then(project => {
        section.create({title:"To do",projectId:project._id}).catch(err=>console.log(err));
        section.create({title:"Completed",projectId:project._id}).catch(err=>console.log(err));
        res.status(200).json({message: "Project successfully created", project})
    }).catch (err=>{
        res.status(401).json({message: "Project not successful created", error: err.message})
    })
})

router.put("/edit", (req, res) => {
    const {id,title,description} = req.body;
    project.findById(id).then(project=>{
        if(title) project.title = title;
        if(description) project.description = description;
        project.save().then(project =>
            res.status(200).json({message: "Project successfully edited", project})
        ).catch (err=>{
            res.status(401).json({message: "Project not successful edited", error: err.message})
        })
    }).catch (err=>{
        res.status(401).json({message: "Project not found", error: err.message})
    })
})

router.put("/edit_employees", (req, res) => {
    const {id,assignedEmployees} = req.body;
    project.findById(id).then(project=>{
        project.assignedEmployees = assignedEmployees;
        project.save().then(project =>
            res.status(200).json({message: "Employees successfully edited", project})
        ).catch (err=>{
            res.status(401).json({message: "Employees not successful edited", error: err.message})
        })
    }).catch (err=>{
        res.status(401).json({message: "Project not found", error: err.message})
    })
})

router.put("/edit_managers", (req, res) => {
    const {id, assignedManagers} = req.body;
    project.findById(id).then(project => {
        project.assignedManagers = assignedManagers;
        project.save().then(project =>
            res.status(200).json({message: "Managers successfully edited", project})
        ).catch(err => {
            res.status(401).json({message: "Managers not successful edited", error: err.message})
        })
    }).catch(err => {
        res.status(401).json({message: "Project not found", error: err.message})
    })
})

router.get("/all_projects", (req,res)=>{
    const {teamId} = req.query;
    project.find({teamId: teamId}).then(projects=>res.status(200).json(projects)).catch(err=>res.status(400).json(err));
})

router.delete("/delete", (req, res) => {
    const {id} = req.query;
    project.findByIdAndDelete(id).then(project => {
        console.log(project);
        try {
            const tasks = project.tasks;
            tasks.forEach(t => {
                task.findByIdAndDelete(t).then(t => console.log(t)).catch(err => console.log(err));
            });
        } catch (err) {
            console.log(err);
        }
        res.status(200).json({message: "Project successfully deleted", project})
    }).catch (err=>{
        res.status(401).json({message: "Project not successful deleted", error: err.message})
    })
})

module.exports = router;