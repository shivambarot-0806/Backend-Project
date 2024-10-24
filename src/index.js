// require("dotenv").config({path: "./.env"})

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 8000
dotenv.config({
    path: "./.env"
})


connectDB()
.then( () => {
    app.listen(PORT, () => {
        console.log(` Server is running on port: ${PORT}`)
    });
    app.on("error", (error) => {
        console.log("error: ",error)
        throw error
    });
}
)
.catch(() => {
    console.log("MONGO DB connection failed !!!!.....");
}
)