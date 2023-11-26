const { request } = require("express");
const catchAsyncErrors = require("./catchAsyncErrors");
const Errorhandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");


exports.isAuthenticatedUser = catchAsyncErrors( async(req,res,next)=>{

    const { token }  = req.headers;
    // console.log("token",token);
  
    if(!token){
        next(new Errorhandler("Please login to access this resource!",(401)))
    }
    const decodedData = jwt.verify(token,process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id)
    next();


});

exports.authorizeRoles = (...roles)=>{

    return(req,res,next)=>{
       
        if(!roles.includes(req.user.role)){ 
            //req.user.roles by default is set to user so if it is not user,then we do the following:

            return next (new Errorhandler(`Role : ${req.user.role} is not allowed to access this resource`,403));
        }
        next();
    }
}


