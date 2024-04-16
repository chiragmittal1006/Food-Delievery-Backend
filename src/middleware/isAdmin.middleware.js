import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const isAdmin = asyncHandler(async (req, res, next) => {
  const user = req.user;

  if (!isValidObjectId(user._id)) {
    throw new ApiError(400, "Invalid User id");
  }

  if (!user.isAdmin) {
    throw new ApiError(403, "Unauthorized request..this person is not admin");
  }
  // If the user is an admin, continue to the next middleware or route handler
  next();
});
