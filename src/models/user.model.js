const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required for creating an account"],
        trim: true,
        unique: [true, "Email address already exists. Please use a different email address."],
        lowercase: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email address.']  // it is came from email regex pattern

    },
    name: {
        type: String,
        required: [true, "Name is required for creating an account"]
        
    },
    password: {
        type: String,
        required: [true, "Password is required for creating an account"],
        minlength:[6, "Password must be at least 6 characters long"],
        select: false
    },
    systemUser:{
        type: Boolean,
        default: false,
        immutable: true,
        select: false
    }

},{
    timestamps: true
})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return
    }


    const hash = await bcrypt.hash(this.password,10)
    this.password = hash;
    return
})


userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;