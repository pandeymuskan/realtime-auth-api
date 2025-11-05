const express=require ("express");

const {register,login,logout,user}=require("../Controllers/userController")
const auth=require("../Middlewares/authMiddleware")
const router=express.Router();


router.post("/register",register);

router.post("/login",login);

router.post("/logout",auth,logout);

router.get("/",auth,user);

module.exports=router;


