import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        productId:{
            type:Number,
            unique:true
        },
        name:{
            type: String,
            required:true
        },
        description:{
            type: String,
            required:true
        },
        image:{
            type: String, //cloudinary ka url
            required:true
        },
        price:{
            type: Number,
            required:true
        },
        category:{
            type: String,
            required:true
        },
        isAvailable:{
            type:Boolean,
            default:true
        }
    },{timestamps:true}
)

export const Product = mongoose.model("Product", productSchema);