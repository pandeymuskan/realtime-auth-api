const {Server}=require('socket.io');

const cookie=require('cookie');
const {verifyJwt}=require("../services/jwt.service");
const User=require("../Models/userModel");

let ioInstance=null;

function initSocket(server,redisAdapter)
{
    const io=new Server(server,{
        cors:{orign:true,credentials:true}
    });
    if(redisAdapter) 
    {
        io.adapter(redisAdapter);
    }

    io.use(async (socket,next)=>{
        try{
           const cookieHeader=socket.handshake.headers.cookie;
           if(!cookieHeader) return next (new Error('No cookie'));
           const parsed=cookie.parse(cookieHeader ||'');
           const token=parsed[process.env.COOKIE_NAME || 'token'];
           if(!token) return next (new  Error ('No token'));
           const decoded=verifyJwt(token);
           if(!decoded || !decoded.userId) return next(new Error('Invalid token'));
          const user=await User.findById(decoded.userId);
          if(!user) return next(new Error('User not found'));
          if(!user.sessionId ||user.sessionId !==decoded.sessionId) return next (new Error ('Session Invalid'));
          socket.user={id:user._id.toString(),role:user.role};
          next();
        }
        catch(err)
        {
            console.error("socket auth error",err);
            next(new Error('Authentication error'));
        }
    });
    io.on('connecion',(socket)=>{
        console.log('socket connected',socket.id,'user',socket.user.id);
        socket.join(`user:${socket.user.id}`);

        socket.on('room:join',(room)=>{
            socket.join(room);
            socket.emit('room:joined',room)
        });
         socket.on('room:leave',(room)=>{
            socket.leave(room);
            socket.emit('room:left',room)
        });

        socket.on('message:send',(payload)=>{
           const {room ,content}=payload ||{};
           if(!room || !content) return;

           socket.to(room).emit('message:new',{
            from:socket.user.id,
            content,
            room,
            createdAt:new Date()
           });
        });
        socket.on('disconnect',()=>{
            console.log('socket disconnected',socket.id);
        });
    });
    ioInstance=io;
    return io;

}
module.exports={
    initSocket,
    get io(){
        if(!ioInstance) throw new  Error('Socket not initialized');
        return ioInstance
    }
};