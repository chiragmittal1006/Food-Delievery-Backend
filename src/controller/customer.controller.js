import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../model/user.model.js";
import { Customer } from "../model/customer.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addCustomer = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const {
    firstname,
    lastname,
    email,
    street,
    city,
    state,
    pincode,
    country,
    phone,
  } = req.body;

  if (!isValidObjectId(userId)) {
    throw new ApiError(404, "user is not logged In");
  }

  const user = await User.findById(userId);

  const customerCreated = await Customer.create({
    firstname,
    lastname,
    email,
    street,
    city,
    state,
    pincode,
    country,
    phone,
    cart: user.cart,
    owner:userId
  });

  const customer = await Customer.findById(customerCreated._id);

  if (!customer) {
    throw new ApiError(500, "customer is not added");
  }

  res.status(200).json(new ApiResponse(200 , customer , "customer data added successfully"))
});

const removeCustomer = asyncHandler(async (req,res)=>{
    const {customerId} = req.body

    if(!isValidObjectId(customerId)){
        throw new ApiError(400 , "customer id is not correct")
    }

    const deletedCustomer = await Customer.findByIdAndDelete(customerId)

    if(!deletedCustomer){
        throw new ApiError(500 , "customer is not deleted")
    }

    res.status(200).json(new ApiResponse(200 , deletedCustomer , "customer deltails deleted successfully"))
})

const getAllCustomer = asyncHandler(async(req,res)=>{
    const allCustomer = await Customer.find()
    
    if(!allCustomer){
        throw new ApiError(400 , "admin is not logged In or there is no customer")
    }

    res.status(200).json(new ApiResponse(200 , allCustomer ,"all customer fetched successfully"))
})

export { addCustomer , removeCustomer , getAllCustomer};
