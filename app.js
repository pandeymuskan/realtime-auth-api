require("dotenv").config();
const express=require("express");
const http=require('http');
const cookieParser=require("cookie-parser");
const authRoutes=require('./Routes/auth')
const connectDB =require("./dbConnect")
const messageRoutes=require("./Routes/messageRoutes");
const {initSocket}=require("./socket/socket")
const {redis}=require("./services/cache.service")
const app=express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth/',authRoutes);
app.use('api/messages/',messageRoutes);
const server=http.createServer(app);

(async function start(){
    try{
        await connectDB();
        initSocket(server);
        const PORT=process.env.PORT ||6000;
        server.listen(PORT,()=>{
               console.log(`Server is running on Port ${PORT}`);

        })
    }
    catch(err)
    {
        console.error("Failed to start",err);
        process.exit(1);
    }
})();


