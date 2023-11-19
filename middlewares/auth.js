const jwt = require("jsonwebtoken")
const User = require("../models/user")

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Access denied! Token missing." })
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
        if (err) {
            return res.status(403).json({ error: "Access denied! Invalid token." })
        }
        const user = await User.findOne({_id: payload._id}).select("-password")
        req.user = user;
        next();
    })
}