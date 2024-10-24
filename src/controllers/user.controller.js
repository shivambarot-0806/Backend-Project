import { asyncHandler } from "../utils/asyncHandler.js";
import { sendErrorResponse } from "../utils/responseHandler.js";
import { sendSuccessResponse } from "../utils/responseHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";



const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false})
        
        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    
    // get user details from frontend
    const {fullname, email, username, password} = req.body
    
    
    // validation - field should not be empty (create a new validation file that conatains checking functions of all fields)
    
    // if (!fullname || !email || !username || !password) {
    //     return sendErrorResponse(res, { message: "All fields are required" }, 400);
    // }

    if([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }


    // check for user already exists
    const existedUser = await User.findOne(
        {$or: [{ username }, { email }]}
    )
    if (existedUser) {
        throw new ApiError(409, "User already exists with same email or username")
    }


    // check for images, avatar
    // const avatarLocalPath = req.files?.avatar[0]?.path;
    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path;
    }
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }
    // console.log(req.files);
    

    // upload images to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }


    // create an object of user in db
    const user = await User.create({
        fullname,
        username,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })


    // remove password and token from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    
    // check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering User");
    }


    // return res
    // sendSuccessResponse(res, createdUser, "User registered successfully", 201);
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );

});

const loginUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    const {email, username, password} = req.body;

    // field cannot be empty
    if (!(username || email)) {
        throw new ApiError(404, "username or email required");
    }


    // check for user exists
    const user = await User.findOne(
        {$or: [{ username }, { email }]}
    )
    if (!user) {
        throw new ApiError(409, "User does not exists, Register User first")
    }

    // if exists check for password and username verification
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }


    // access and refresh token
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    const options = {
        httpOnly: true,
        secure: true
    };
    //send cookie
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {user: loggedInUser, accessToken, refreshToken},
            "User logged In Successfully"
        )
    )
    

});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json( new ApiResponse(200, {}, "User logged Out Successfully"));

});

const refreshAccessToken = asyncHandler(async (req, res) => {
    
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }
    
        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token was expired or used");
        }
    
        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
        
        const options = {
            httpOnly: true,
            secure: true
        }
        
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {accessToken, refreshToken}, "Access Token refreshed"));

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }
});

export { 
    registerUser, 
    loginUser, 
    logoutUser,
    refreshAccessToken 
};