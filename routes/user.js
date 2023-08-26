const express = require('express')
const router = express.Router()

const {login,signup} = require("../controllers/auth")
const {auth,isStudent,isAdmin} = require("../middlewares/auth")

router.post("/login",login)
router.post("/signup",signup)

//testing route
router.get("/test",auth,(req,res) => {
    res.json({
        success:true,
        message:"Welcome to protected route for Tests"
    })
})
//protected route
router.get("/student" ,auth,isStudent,(req,res) => {
    res.json({
        success:true,
        message:"Welcome to protected route for students"
    })
})

router.get("/admin",auth,isAdmin,(req,res) => {
    res.json({
        success:true,
        message:"Welcome to protected route for Admins"
    })
})

module.exports = router