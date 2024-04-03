const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const ClientSchema = new mongoose.Schema({
    email: String,
    _id: String,
    password: String,
    profileDescription: String
})

ClientSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id: this._id}, "shhhh",{expiresIn: "1d"});
    return token;
}

const ClientModel = mongoose.model("Register",ClientSchema);
module.exports = ClientModel
