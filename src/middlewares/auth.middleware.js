import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // get token from req either in cookie or header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized Access");
        }
    
        // if token found verify and decode it, so that we can get user id 
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        // then create user instance to access user info
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if(!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
    
        // add this user object in req so that we can access it in controller
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});