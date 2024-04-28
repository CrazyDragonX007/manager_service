const Message = require("../models/message");
const router = require("express").Router();

router.post("/get_messages", async (req, res) => {
    try {
        const {from, to} = req.body;
        const messages = await Message.find({users: {$all: [from, to],}}).sort({updatedAt: 1});
        const projectedMessages = messages.map((msg) => {
            return {
                fromSelf: msg.sender === from,
                message: msg.message
            };
        });
        res.status(200).json(projectedMessages);
    } catch (err) {
        console.log(err);
        res.status(400).json({message: "Failed to retrieve messages from the database"});
    }
});

router.post("/add_message", async (req, res) => {
    const {from, to, message} = req.body;
    Message.create({
        message: message, users: [from,to], sender: from
    }).then((data) => {
        res.status(200).json({fromSelf:true,message:data.message});
    }).catch((err) => {
        console.log(err);
        return res.status(400).json({message: "Failed to add message to the database"});
    });
});

module.exports = router;