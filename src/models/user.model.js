import mongoose, {Schema} from "mongoose";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase:  true
        },
        fullname: {
            type: String,
            required: true,
            index: true
        },
        avatar: {
            type: String,  // cloudinary url will be stored
            required: true
        },
        coverImage: {
            type: String,  // cloudinary url will be stored
            required: true
        },
        watchHistory: [
            {
                type: mongoose.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)


export const User = mongoose.model("User", userSchema)