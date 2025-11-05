#  Real-Time Auth API (JWT + Socket.IO)

A simple Node.js project implementing **authentication and real-time communication** using:

- JWT tokens for authentication
- Express.js REST API
- Socket.IO for bidirectional communication
- MongoDB for data storage
- Redis (optional) for caching
- Single-session login (user can log in on only one device at a time)

---

##  Features
- User register, login, and logout
- JWT authentication with cookies
- One active session per user
- Protected routes using middleware
- Real-time updates with Socket.IO
- Message broadcasting via rooms/namespaces

---

##  Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/<yourusername>/realtime-auth-api.git
   cd realtime-auth-api

---

2. **Install dependencies**
    npm install
    
---
3. ***Create .env file***

MONGO_URL=mongodb://localhost:27017/realtime_auth
JWT_SECRET=supersecret
REDIS_URL=redis://localhost:6379
COOKIE_NAME=token
PORT=5000

---
4. ***Run the server***
npm start