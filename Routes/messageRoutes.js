const express=require("express");
const router=express.Router();

const controller=require("../Controllers/messageController");
const auth=require('../Middlewares/authMiddleware');

router.post("/",auth,controller.postMessage);
router.get('room/:room',auth,controller.getMessagesByRoom);

module.exports=router;