const Cart = require("../models/cartModel");
const ErrorHandler = require("../utils/errorHandler")
const catchAsyncErrors = require("../middleware/catchAsyncErrors");


// Create new cart or update exisiting cart
exports.createCart = catchAsyncErrors(async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if a cart exists for the user
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // If no cart exists, create a new one
      req.body.user = userId;
      cart = await Cart.create(req.body);
    } else {
      // If a cart exists, update it by adding new products
      const updatedCart = await Cart.findByIdAndUpdate(
        cart._id,
        {
          $push: { cartItems: { $each: req.body.cartItems } },
        },
        {
          new: true,
          runValidators: true,
          useFindAndModify: false,
        }
      );

      cart = updatedCart;
    }

    res.status(201).json({
      success: true,
      cart,
    });
  } catch (err) {
    console.log(err);
    next(new ErrorHandler("Internal Server Error", 500));
  }
});


//Update cart
exports.updateCart = catchAsyncErrors(async(req,res,next)=>{

    let cart = await Cart.findById(req.params.id);

    if (!cart){
        return next(new ErrorHandler("Cart not found",404));
    }

    cart = await Cart.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(201).json({
        success:true,
        cart
    })

});

//Get cart
exports.getCart = catchAsyncErrors(async (req, res, next) => {
  
  const userId = req.params.userId;

  let cart = await Cart.findOne({ userId: userId });

  if (!cart) {
      return next(new ErrorHandler("Cart not found", 404));
  }

  res.status(200).json({
      success: true,
      cart
  });
});



  

  

