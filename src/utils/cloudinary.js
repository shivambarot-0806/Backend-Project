import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath, filename, username) => {
    try {
        if (!localFilePath) return null;
        const folders = await cloudinary.api.root_folders();
        // console.log(folders);
        
        if (!folders?.name === username) {
            const folder = await cloudinary.api.create_folder(username);
            // console.log(folder);
        }
        
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto",
            public_id: filename,
            folder: username

        }).catch((error) => {
            console.log(error);
        });

        // after file upload response contain url take it in use
        // console.log("file uploaded succesfully ",response.url);
        
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
}

const deleteFromCloudinary = async (filename) => {
    try {
        
        await cloudinary.api.delete_resources([filename], {
            resource_type: "image"
        })
        
    } catch (error) {
        console.log(error);
    }
}

export { uploadOnCloudinary, deleteFromCloudinary };