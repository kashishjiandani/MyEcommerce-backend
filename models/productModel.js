const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter product name"],
        trim:true
    }, 
    description:{
        type:String,
        required:[true,"Please enter product description"]
    },
    price:{
        type:Number,
        required:[true,"Please enter product price"],
        maxLength:[8,"Price can't exceed 8 figures"]
    }, 
    ratings:{
        type:Number,
        default:0
    }, 
    images:[
            {
                type:String,
                required:true
            }
    ],
    category:{
        type:[String],
        required:[true,"Please enter product category"]
    },
    subCategory:{
        type:String,
        required:[true,"Please enter product sub category"]
    },
    color:{
        type:String,
        required:[true,"Please enter product color"]
    },
    brand:{
        type:String,
        required:[true,"Please enter product brand"]
    },
    size:{
        type:String,
        required:[true,"Please enter product size"]
    },
    stock:{
        type:Number,
        required:[true,"Please enter product stock"],
        maxLength:[4,"Stock cannot exceed 4 figures"],
        default:1
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:"User",
                required:true
            },
            name:{
                type:String,
                required:true
            }, 
             rating:{
                type:Number,
                required:true
            }, 
             comment:{
                type:String,
                required:true
            },
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    }
})

module.exports = mongoose.model("Product",productSchema);