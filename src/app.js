import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(cors({
    // origin: process.env.CORS_ORIGIN, //telling ki kaha frontend prr api allow krni hai
    origin: 'http://localhost:3000',
    credentials: true,
    // allowedHeaders , content-type , 
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit : "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//importing the routes

import userRouter from "./router/userRouter.js"
import productRouter from "./router/productRouter.js"
import customerRouter from "./router/customerRouter.js"


// routes

app.use("/api/v1/users",userRouter)
app.use("/api/v1/product",productRouter)
app.use("/api/v1/customer",customerRouter)



export {app}