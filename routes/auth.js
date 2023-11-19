const router = require('express').Router()
const { FindCursor } = require('mongodb');
const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const auth = require("../middlewares/auth");

router.post("/register", async (req, res) => {

    const {name, email, password} = req.body;

    if(!name || !email || !password){
        return res.
        status(400).
        json({error: 'Please enter all required fields'});
    }
    //name validation
    if (name.length > 20){
        return res.status(400).json({error: "Maximum length allowed for name is 20 characters"})
    }
    //email validation
    const emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    if (!emailReg.test(email)){
        return res.status(400).json({error: "Please enter a valid email."})
    }
    //password validation
    if (password.length < 6){
        return res.status(400).json({error: "Password must be atleast 6 characters"})
    }

    const userAlreadyExist = await User.findOne({email});
    if(userAlreadyExist){
        return res.status(400).json({error: `User with email [${email}] already exists. Please try again.`})
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ name, email, password: hashedPassword });

        const result = newUser.save();
        return res.status(201).json({message: "User added successfully"});  

    } catch(err) {
        console.log(err);
        return res.status(500).json({error: err.message})
    }
})

router.post("/login", async (req, res) => {

    const { email, password } = req.body;

    if(!email || !password) {
        return res.
        status(400).
        json({error: 'Please enter all required fields'});
    }
    //email validation
    const emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    if (!emailReg.test(email)){
        return res.status(400).json({error: "Please enter a valid email."})
    }
    
    try {
        const doesUserExist = await User.findOne({email});
        if (!doesUserExist){
            return res.status(400).json({error: "Invalid email or password!"})
        }

        const arePasswordSame = await bcrypt.compare(password, doesUserExist.password);
        if (!arePasswordSame){
            return res.status(400).json({error: "Invalid email or password!"})
        }

        const payload = { _id: doesUserExist._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        const user = {...doesUserExist._doc, password: undefined};
        return res.status(200).json({ token, user})
    } catch (err) {
        console.log(err);
        return res.status(500).json({error: err.message});
    }
})

router.get("/me", auth, (req, res) => {
    return res.status(200).json({ ...req.user._doc });
})

module.exports = router;