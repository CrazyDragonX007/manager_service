const jwt = require("jsonwebtoken")
const { jwt_secret } = require("./config")
const project = require("../models/project")

exports.adminAuth = (req, res, next) => {
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(token, jwt_secret, (err, decodedToken) => {
            if (err) {
                console.log(err)
                return res.status(401).json({ message: "Not authorized" })
            } else {
                if (decodedToken.role !== "Admin") {
                    return res.status(401).json({ message: "Not authorized" })
                } else {
                    next()
                }
            }
        })
    } else {
        return res
            .status(401)
            .json({ message: "Not authorized, token not available" })
    }
}

exports.managerOrAdminAuth = (req, res, next) => {
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(token, jwt_secret, (err, decodedToken) => {
            if (err) {
                console.log(err)
                return res.status(401).json({ message: "Not authorized" })
            } else {
                if (decodedToken.role !== "Admin" && decodedToken.role !== "Manager") {
                    console.log(decodedToken.role)
                    return res.status(401).json({ message: "Not authorized" })
                } else {
                    next()
                }
            }
        })
    } else {
        return res.status(401).json({ message: "Not authorized, token not available" })
    }
}

exports.assignedToProject = (req, res, next) => {
const token = req.cookies.jwt
    if (token) {
        jwt.verify(token, jwt_secret, (err, decodedToken) => {
            if (err) {
                console.log(err)
                return res.status(401).json({ message: "Not authorized" })
            } else {
                const {projectId} = req.body;
                project.findById(projectId).then(project=>{
                    if(project?.assignedManagers?.includes(decodedToken.email) || project?.assignedEmployees?.includes(decodedToken.email) || decodedToken.role === "Admin"){
                        next()
                    }else{
                        return res.status(401).json({ message: "Not assigned to project" })
                    }
                }).catch(err=>{
                    console.log(err);
                    return res.status(401).json({ message: "Error occurred finding project" })
                })
            }
        })
    } else {
        return res.status(401).json({ message: "Not authorized, token not available" })
    }
}

exports.getEmailFromToken = (req, res, next) => {
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(token, jwt_secret, (err, decodedToken) => {
            if (err) {
                console.log(err)
                return res.status(401).json({ message: "Not authorized" })
            } else {
                req.user_email = decodedToken.email;
                next()
            }
        })
    } else {
        return res.status(401).json({ message: "Not authorized, token not available" })
    }
}