const bcrypt = require('bcrypt')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
require('dotenv').config()

//signup route handler

exports.signup = async (req,res) => {
    try {
        //get data
        const {name,email,password,role} = req.body;
        //check if user already exists
        const existingUser = await User.findOne({email})

        if(existingUser) {
            return res.status(400).json({
                success:false,
                message: "User already exists" 
            })
        }
        //secure password
        let hashedPassword ;
        try {
            hashedPassword = await bcrypt.hash(password,10)
        }
        catch(error) {
            return res.status(500).json({
                success:false,
                message:"Error in hashing password"
            })
        }

        //create entry for user
        const user = await User.create({
            name,email,password:hashedPassword , role
        })

        return res.status(200).json({
            success:true,
            message:"User Created Succesfully"
        })

    }
    catch(error) {
        console.log(error)
        return res.json(500).json({
            success:false,
            message:"User cannot be registered"
        })
    }
}

//login handler

exports.login = async (req,res) => {
    try {
        //fetch data
        const {email,password} = req.body;
        //validation email and password 
        if(!email || !password) {
            return res.status(400).json({
                success:false,
                message:"Please fill details carefully"
            })
        }
        //check for registered user
        let user = await User.findOne({email})
        if(!user) {
            return res.status(401).json({
                success:false,
                message:"Sign up first"
            })
        }
        const payload = {
            email:user.email,
            id:user._id,
            role:user.role 
        }

        //verify password and generate JWT token
        if(await bcrypt.compare(password,user.password)) {
            //password matched
            let token = jwt.sign(payload,process.env.JWT_SECRET, {expiresIn:"2h"})

            user = user.toObject()
            user.token = token
            user.password = undefined
            const options = {
                expiresIn: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true

            }
            res.cookie("token" , token , options).status(200).json({
                success:true,
                token,
                message:"User logged in Successfully",
                user,
               
            })

        }
        else {
            //password did not match
            return res.status(403).json({
                success:false,
                message:"Password incorrect"
            })
        }

    }
    catch(error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Login failure"
        })
    }
}