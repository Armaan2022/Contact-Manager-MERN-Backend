const router = require('express').Router();
const Contact = require('../models/Contact');

const auth = require("../middlewares/auth");
const mongoose = require('mongoose');

router.post("/contact", auth, async(req, res) => {

    const { name, email, phone, address, notes } = req.body;

    //name validation
    if (!name){
        return res.status(400).json({error: 'Name is required'});
    }
    if (name.length > 200){
        return res.status(400).json({error: "Name is too long. Max length allowed is 200."})
    }
    //email validation
    if (email) {
        const emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

        if (!emailReg.test(email)){
            return res.status(400).json({error: "Please enter a valid email."})
        }
    }
    //phone validation
    if (!phone){
        return res.status(400).json({error: 'Phone number is required'});
    }
    if (phone.toString().length> 25){
        return res.status(400).json({error: 'Enter a valid phone number.'})
    }

    try{
        const newContact = new Contact({ name, email, phone, address, notes, postedBy: req.user._id });
        const result = await newContact.save();
        return res.status(201).json({ ...result._doc });

    } catch(err) {
        console.log(err);
    }
});

router.get("/mycontacts", auth, async (req, res) => {
    try{
        const mycontacts = await Contact.find({ postedBy: req.user._id }).populate("postedBy","-password");
        return res.status(200).json({ contacts: mycontacts.reverse() });
    } catch(err) {
        console.log(err);
    }
});

router.put("/contact", auth, async(req, res) => {
    const { id } = req.body;

    if (!id){
        return res.status(400).json({error: "No ID specified."})
    }
    if (!mongoose.isValidObjectId(id)){
        return res.status(400).json({error: "Enter a valid ID."})
    }

    try{
        const contact = await Contact.findOne({ _id: id });
        if (!contact) return res.status(400).json({error: "No contact found."});

        if (req.user._id.toString() !== contact.postedBy._id.toString()){
            return res.status(401).json({error: "You can only edit your contacts."});
        }
        const updatedContact = { ...req.body }
        const result = await Contact.findByIdAndUpdate(id, updatedContact, {new: true});
        return res.status(200).json({ ...result._doc });
    } catch(err) {
        console.log(err);
    }
});

router.delete("/delete/:id", auth, async(req, res) => {
    const { id } = req.params;

    if (!id){
        return res.status(400).json({error: "No ID specified."})
    }
    if (!mongoose.isValidObjectId(id)){
        return res.status(400).json({error: "Enter a valid ID."})
    }
    try{
        const contact = await Contact.findOne({ _id: id });
        if (!contact) return res.status(400).json({error: "No contact found."});

        if (req.user._id.toString() !== contact.postedBy._id.toString()){
            return res.status(401).json({error: "You can only delete your contacts."});
        }
        const result = await Contact.deleteOne({ _id: id });
        const mycontacts = await Contact.find({ postedBy: req.user._id }).populate("postedBy","-password");
        return res.status(200).json({ contacts: mycontacts.reverse() })
    } catch(err) {
        console.log(err);
    }
});

router.get("/contact/:id", auth, async(req, res) => {
    const { id } = req.params;

    if (!id){
        return res.status(400).json({error: "No ID specified."})
    }
    if (!mongoose.isValidObjectId(id)){
        return res.status(400).json({error: "Enter a valid ID."})
    }
    try{
        const contact = await Contact.findOne({ _id : id });
        if (!contact) return res.status(400).json({error: "No contact found."});
        return res.status(200).json({ ...contact._doc });
    } catch(err) {
        console.log(err);
    }
});

module.exports = router;