import { isValidObjectId } from "mongoose";
import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // validate krr rhe hai ki jab user ka refresh token le rhe hai toh baar baar usko password na daalna pade aur mongoose ke methods kick in na hojae

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  /*
    username , email , password from user
    validate all that they are not empty
    check if user already exist
    create user object - create entry in db
    remove password and refresh token field from response
    check for user creation
    */

  const { username, email, password} = req.body;

  if ([email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Please enter valid details");
  }

  //checking if the email is having any blank space or any special character
  let flag1 = false;
  let flag2 = true;
  var splittedname = email.split("");
  for (var i = 0; i < splittedname.length; i++) {
    if (splittedname[i] === "@") {
      flag1 = true;
    }
    if (
      splittedname[i] === " " /* || !/^[a-zA-Z0-9]+$/.test(splittedname[i]) */
    ) {
      flag2 = false;
    }
  }

  if (flag1 === false || flag2 === false) {
    throw new ApiError(400, "Please enter valid email id");
  } else {
    // console.log("valid email is given");
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existingUser) {
    throw new ApiError(409, "user already exists");
  }

  //creating the user
  const user = await User.create({
    email,
    password,
    username: username.toLowerCase(),
  });

  //making it possible to be a user without refreshtoken and password
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while user registering");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  /*
    get the username , email , password from user
    validate these all
    generate accesstoken refreshtoken
    send cookie and response
    */

  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "please provide atleast email or username");
  }

  const userFinded = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!userFinded) {
    throw new ApiError(404, "user don't exist");
  }

  const isPasswordValid = await userFinded.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    userFinded._id
  );

  const loggedInUser = await User.findById(userFinded._id).select(
    "-password -refreshtoken"
  );

  //making sure ki cookie frontend se koi ched chaad na kar paye
  const options = {
    httpOnly: true,
    sameSite:"none",
    secure: true,
  };

  //cookie parsor
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken }, //sending this accesstoken and refreshtoken ki agar user ko cookie store krni hai locally ya mobile app wgera ke liye toh....
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {

const userId = req.user?._id

if(!userId){
    throw new ApiError(404 , "user is not loggedIn")
}

await User.findByIdAndUpdate(
          userId,
          {
            $unset: {
              refreshToken: 1 /* it will remove the field from document */,
            },
          },
          { new: true }
        );
    
        const options = {
          httpOnly: true,
          sameSite:"none",
          secure: true,
        };
    
        return res
          .status(200)
          .clearCookie("accessToken", options)
          .clearCookie("refreshToken", options)
          .json(new ApiResponse(200, {}, "user Logout successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    // .select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid refresh Token");
    }

    if (user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      sameSite:"none",
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    //res ke liye cookie use krte hai aur req ke liye cookies
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "please enter the valid old password");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});

const addToCart = asyncHandler(async (req, res) => {
    const { cart } = req.body;

    if (!req.user) {
        throw new ApiError(404, "User is not logged in");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { cart: cart } }, // Merge the existing cart with the new cart
        { new: true } // To return the updated document
    );

    if (!user) {
        throw new ApiError(500, "Bad request");
    }

    res.status(200).json(new ApiResponse(200, user, "Cart added successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  addToCart
};
