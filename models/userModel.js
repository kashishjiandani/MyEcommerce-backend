const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto")


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your  name"],
        maxLength:[30,"Name can't exceed 13 characters"],
        minLength:[4,"Name should have more than 4 characters"]
    }, 
    email:{
        type:String,
        required:[true,"Please enter your email"],
        unique:true,
        validate:[validator.isEmail,"Please enter a valid email!"]
    },
    password:{
        type:String,
        required:[true,"Please enter your password"],
        minLength:[8,"Password should be greater than 8 characters."],
        select:false //when doing findAll in adminside we will get everything besides password
    },  
    avatar:
        {
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        },
    role:{
        type:String,
        default:"user"
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
});

//bycrpt
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next();
    }
        this.password = await bcrypt.hash(this.password,10)
})

//JWT Token
 userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET)
 }

//Compare password

userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}

//Generating password reset token
userSchema.methods.getResetPasswordToken = async function(){

    //Generating token
    const resetToken = crypto.randomBytes(20).toString("hex");

    //Hashing and adding reset password token to userSchema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    this.resetPasswordExpire = Date.now() + 15 *60 * 1000;

    return resetToken
}


module.exports = mongoose.model("User",userSchema)