//Creating token and saving token

const sendToken = (user,statusCode,res)=>{
    // console.log("user",user)
    const token = user.getJWTToken();

    res.status(statusCode).json({
        success:true,
        user,
        token,
    })
}

module.exports = sendToken;