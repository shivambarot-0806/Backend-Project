import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`);
        console.log("MONGODB Connection established !! DB HOST: ",connectionInstance.connection.host);
        //console.log(connectionInstance);
    } catch (error) {
        console.error(" OHHHHHH !!!!!! MONGODB ERROR FOUND : ",error);
        process.exit(1);
    }
}

export default connectDB;