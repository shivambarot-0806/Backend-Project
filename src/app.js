import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.use((req, res, next) => {
    console.log(`${req.method} request to ${req.url}`);
    next();
});


// router import(this is a standardized method of importing router)
import userRouter from "./routes/user.routes.js";

// we need middleware to use router that's why .use() is used instead of get and post and listen
app.use("/api/v1/users", userRouter);

export { app }