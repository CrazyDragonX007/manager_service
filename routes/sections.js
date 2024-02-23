const express = require("express")
const router = express.Router();
const section = require("../models/section");
const {managerOrAdminAuth} = require("../utils/auth");

router.post("/create",managerOrAdminAuth, (req, res) => {
    const {title,projectId} = req.body;
    section.create({title,projectId}).then(s =>{
        res.status(200).json({message: "Section successfully created", section: s})
    }).catch(err=>{
        res.status(400).json({message: "Section not successfully created", error: err.message});
    })
});

router.put("/edit",managerOrAdminAuth, (req, res) => {
    const {id,title} = req.body;
    if(!title) return res.status(400).json({message: "No title provided"});
    if(!id) return res.status(400).json({message: "No id provided"});
    section.findById(id).then(s=>{
        s.title = title;
        s.save().then(s =>
            res.status(200).json({message: "Section successfully edited", section: s})
        ).catch (err=>{
            res.status(400).json({message: "Section not successful edited", error: err.message,})
        })
    })
});

router.get("/all_sections", (req,res)=>{
    const {projectId} = req.query;
    if(projectId) {
        section.find({projectId}).then(sections => {
            res.status(200).json({message: "Sections successfully found", sections})
        }).catch(err => {
            console.log(err);
            res.status(400).json({message: "Sections not found", error: err.message})
        })
    }else{
        res.status(400).json({message: "No projectId provided"})
    }
});

router.delete("/delete",managerOrAdminAuth, (req, res) => {
    const {id} = req.body;
    section.findById(id).then(s=>{
        if(s.tasks.length > 0) return res.status(400).json({message: "Kindly reassign tasks in this section before deleting"});
        section.findByIdAndDelete(id).then(s => {
            res.status(200).json({message: "Section successfully deleted", section: s})
        }).catch(err => {
            res.status(400).json({message: "Section could not be deleted", error: err.message})
        });
    }).catch(err=>{
        console.log(err);
        res.status(400).json({message: "Section not found", error: err.message})
    });
});

module.exports = router;