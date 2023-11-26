const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler")
const catchAsyncErrors = require("../middleware/catchAsyncErrors");


//Create new product(Admin)
exports.createProduct = catchAsyncErrors(async(req,res,next)=>{
    
    try{
    req.body.user = req.user.id

    const product = await Product.create(req.body);

    res.status(201).json({
        success:true,
        product
    })
    }catch(err){console.log(err);}

    
});
//Update product(Admin)
exports.updateProduct = catchAsyncErrors(async(req,res,next)=>{

    let product = await Product.findById(req.params.id);

    if (!product){
        return next(new ErrorHandler("Product not found",404));
    }

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(201).json({
        success:true,
        product
    })

});

//Delete product(Admin)
exports.deleteProduct = catchAsyncErrors(async(req,res,next)=>{

    let product = await Product.findById(req.params.id);

    if (!product){
        return next(new ErrorHandler("Product not found",404));
    }

    product = await Product.deleteOne();

    res.status(201).json({
        success:true,
        message:"Product deleted succesfully"
    })

});

//Get single product
exports.getProduct = catchAsyncErrors(async(req,res,next)=>{

    let product = await Product.findById(req.params.id);

    if (!product){
        return next(new ErrorHandler("Product not found",404));
    }

    res.status(200).json({
        success:true,
        product
    })

});

//Get all products
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
    try {
      // Extract all query parameters
      const queryParams = req.query;
      console.log(queryParams);
  
      // Build filter object dynamically
      const filters = {};
      for (const key in queryParams) {
        let value = queryParams[key];
        let temp = value.split(',');
        // Check if the parameter is an array and use $in operator
        if (temp.length>1) {
          filters[key] = { $in: temp };
        } else {
          // Use regex for case-insensitive partial matching
          filters[key] = new RegExp(queryParams[key], 'i');
        }
      }
  
      // Use the filters in the Mongoose query
      const products = await Product.find(filters);
  
      res.json({ success: true, products });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

  


//Create new review or update existing review
exports.createProductReview = catchAsyncErrors(async(req,res,next)=>{

    const {comment,rating,productId} = req.body

    const review = {
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment
    }

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(rev=>rev.user.toString() === req.user._id.toString())

    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString()) {
                rev.rating = rating;
                rev.comment = comment;
            }
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }    
    let avg=0;

    product.reviews.forEach(rev=>{
        avg=avg+rev.rating })

    product.ratings =avg/product.reviews.length;

    await product.save({validateBeforeSave:false})

    res.status(200).json({
        success:true,
        
    })
})

// Get All Reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);
  
    if (!product) {
        return next(new ErrorHandler("Product not found",404));
    }
  
    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  });
  
  // Delete Review
  exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
  
    if (!product) {
        return next(new ErrorHandler("Product not found",404));
    }
  
    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );
  
    let avg = 0;
  
    reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    let ratings = 0;
  
    if (reviews.length === 0) {
      ratings = 0;
    } else {
      ratings = avg / reviews.length;
    }
  
    const numOfReviews = reviews.length;
  
    await Product.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
  
    res.status(200).json({
      success: true,
    });
  });