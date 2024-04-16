import { Product } from "../model/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fileUploadCloudinary } from "../utils/cloudinary.js";

const addProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category } = req.body;

  if (
    [name, description, price, category].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(
      400,
      "Please enter valid name , description , category and price"
    );
  }

  const totalProducts = await Product.find();

  let totalProductNumber;

  if (totalProducts.length > 0) {
    totalProductNumber = totalProducts.length + 1;
  } else {
    totalProductNumber = 1;
  }

  let productImageLocalPath = req.file?.path;

  if (!productImageLocalPath) {
    throw new ApiError(400, "product image is required");
  }

  let productImageCloudinary = await fileUploadCloudinary(
    productImageLocalPath
  );

  if (!productImageCloudinary) {
    throw new ApiError(400, "product image not uploaded on cloudinary");
  }

  const newProduct = await Product.create({
    productId: totalProductNumber,
    name,
    description,
    category,
    price,
    image: productImageCloudinary.url,
  });

  if (!newProduct) {
    throw new ApiError(500, "internal server issue product is not added");
  }

  res
    .status(200)
    .json(new ApiResponse(200, newProduct, "Product added successfully"));
});

const deleteProduct = asyncHandler(async(req,res)=>{

    const {productId} = req.body;

    const deletedProduct = await Product.findOneAndDelete({productId:productId})

    if(!deletedProduct){
        throw new ApiError(400 , "product is not deleted")
    }

    res.status(200).json(new ApiResponse(200 , deletedProduct , "product deleted successfully"))
})

const updateProduct = asyncHandler(async (req,res)=>{

    const {name , description , price , category} = req.body

    if(!name || !description || !price || !category){
        throw new ApiError(400 , "please enter valid details")
    }

    const {productId} = req.body;

    const updatedProduct = await Product.findOneAndUpdate({productId}, {name , description , price , category})

    if(!updatedProduct){
        throw new ApiError(500 , "server issue product is not updated")
    }

    res.status(200).json(new ApiResponse(200 , updatedProduct , "product updated successfully"))
})

const getAllProducts = asyncHandler(async(req,res)=>{
    const allProducts = await Product.find();

    if(!allProducts){
        throw new ApiError(400 , "either there is no product or unable to fetch the product list")
    }

    res.status(200).json(new ApiResponse(200 , allProducts , "all products fetched successfully"))
})

export { addProduct , deleteProduct , updateProduct , getAllProducts };
