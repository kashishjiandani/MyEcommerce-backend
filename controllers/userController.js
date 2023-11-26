const ErrorHandler = require("../utils/errorHandler")
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto")


// Register a user
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        const user = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: "this is a sample id",
                url: "profilepicUrl"
            }
        });

        // Log user data to the console
        console.log("User created successfullyy:", user);

        // Send token and success message
        sendToken(user, 201, res, "User registered successfully");
    } catch (error) {
        // Send error message
        res.status(500).json({
            success: false,
            message: "Registration failed",
            error: error.message // You can customize the error message as needed
        });
    }
});



//Login user 
exports.loginUser = catchAsyncErrors(async(req,res,next)=>{

    try{
        const {email,password} = req.body;

        if(!email || !password){
            return next (new ErrorHandler("Please enter Email and Password"))
        }
    
        const user = await User.findOne({email:email}).select("+password");
        
    
        if(!user){
            return next (new ErrorHandler("Invalid email or password",401));
        }
    
        const isPasswordMatched = await user.comparePassword(password);
    
        if(!isPasswordMatched){
            return next (new ErrorHandler("Invalid email or password",401));
        }
        // console.log("User Logged in successfully:", user);
        sendToken(user,200,res);

    }catch(err){
        console.log(err);
    }



});


//Logout User

exports.logout = catchAsyncErrors(async(req,res,next)=>{

    res.status(200).json({
        succces:true,
        message:"Logged Out"
    })
})

//Forgot Password

exports.forgotPassword = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findOne({email:req.body.email})

    if(!user){
        return next(new ErrorHandler("User not found",404))
    }

    //Get reset password token
    const resetToken = await User.getResetPasswordToken();

    await user.save({validateBeforeSave:false})

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email,then please ignore it.`

    try{

        await sendEmail({
            email:user.email,
            subject:`Ecommerce Password Recovery`,
            message
        });

        res.status(200).json({
            succces:true,
            message:`Email sent to ${user.email} successfully!`
        })

    }catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave:false})

        return next(new ErrorHandler(error.message,500));


    }
})

//Reset Password
exports.resetPassword = catchAsyncErrors(async(req,res,next)=>{
    //creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire : {$gt:Date.now()},
    })

    if(!user){
        return next(
            new ErrorHandler("Reset Password Token is invalid or has been expired",400)
        )
    }

    if(req.body.password!==req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match",400))
    }

    user.password = req.body.password;
    user.resetPasswordExpire=undefined;
    user.resetPasswordToken=undefined;

    await user.save();

    sendToken(user,200,res)
})



//Get User Details
exports.getUserDetails = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.user.id);

    res.status(200).json({
        succces:true,
        user
    })
})

//Change Password
exports.changePassword = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Old password is incorrect",400))
    }

    if(req.body.newPassword !==req.body.confirmPassword){
        return next(new ErrorHandler("Old password is incorrect",400))
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user,200,res)
})


//Update User Profile
exports.updateProfile = catchAsyncErrors(async(req,res,next)=>{

    const newUserData = {
        name:req.body.name,
        email:req.body.email,
    };
    //cloudinary will be added later so we will uodate profile picture later

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })

    res.status(200).json({
        succces:true,
        user
    })
})

//Get all users(Admin)
exports.getAllUsers = catchAsyncErrors(async(req,res,next)=>{

    const users = await User.find();

    res.status(200).json({
        succces:true,
        users
    })
})

//Get single user details(Admin)
exports.getUserDetailsAdmin = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.params.id);

    if(!user){
        return next(
            new ErrorHandler(`User doesn't exist with the id ${req.params.id}`)
        )
    }

    res.status(200).json({
        succces:true,
        user
    })
})


//Update User Role(Admin)
exports.updateUserRole = catchAsyncErrors(async(req,res,next)=>{

    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    };


    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })

    res.status(200).json({
        succces:true,
        user
    })
})

//Delete User(Admin)
exports.deleteUser = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.params.id);
    console.log(user)

    if(!user){
        return next(
            new ErrorHandler(`User doesn't exist with the id ${req.params.id}`)
        )
    }

    await user.deleteOne();
 
    res.status(200).json({
        succces:true,
        message:"User deleted successfully"
    })
})