const project = require("../models/project");
const express = require("express")
const router = express.Router();
const {adminAuth, managerOrAdminAuth} = require("../utils/auth");
const task = require("../models/task");

router.post("/create",adminAuth, (req, res) => {
    const {title,description,createdBy,assignedManagers,assignedEmployees,sections} = req.body;
    project.create({
            title,
            description,
            createdBy,
            assignedManagers,
            assignedEmployees,
            sections
    }).then(project =>
            res.status(200).json({message: "Project successfully created", project})
    ).catch (err=>{
        res.status(401).json({message: "Project not successful created", error: err.message})
    })
})

router.put("/edit",adminAuth, (req, res) => {
    const {id,title,description,assignedManagers,assignedEmployees, sections} = req.body;
    project.findById(id).then(project=>{
        if(title) project.title = title;
        if(description) project.description = description;
        if(assignedManagers) project.assignedManagers = assignedManagers;
        if(assignedEmployees) project.assignedEmployees = assignedEmployees;
        if(sections) project.sections = sections;
        project.save().then(project =>
            res.status(200).json({message: "Project successfully edited", project})
        ).catch (err=>{
            res.status(401).json({message: "Project not successful edited", error: err.message})
        })
    }).catch (err=>{
        res.status(401).json({message: "Project not found", error: err.message})
    })
})

router.put("/edit_employees",managerOrAdminAuth, (req, res) => {
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

router.put("/edit_managers",adminAuth, (req, res) => {
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

router.get("/all_projects",managerOrAdminAuth, (req,res)=>{
    project.find({}).then(projects=>res.status(200).json(projects)).catch(err=>res.status(400).json(err));
})

router.delete("/delete",adminAuth, (req, res) => {
    const {id} = req.body;
    project.findByIdAndDelete(id).then(project => {
        console.log(project);
        try {
            tasks = project.tasks;
            tasks.forEach(t => {
                task.findByIdAndDelete(t).then(t=>console.log(t)).catch(err=>console.log(err));
            });
        }catch (err){
            console.log(err);
        }
        res.status(200).json({message: "Project successfully deleted", project})
    }).catch (err=>{
        res.status(401).json({message: "Project not successful deleted", error: err.message})
    })
})

module.exports = router;