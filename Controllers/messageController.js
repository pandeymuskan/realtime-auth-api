const Message = require("../Models/messageModel");
const { getCache, setCache, delCache } = require("../services/cache.service");
const socketModule = require("../socket/socket");

// POST /api/messages
exports.postMessage = async (req, res) => {
  try {
    const { room, content } = req.body;

    if (!room || !content) {
      return res.status(400).json({ message: "Room and content are required." });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const msg = await Message.create({
      sender: req.user._id,
      room,
      content,
    });

    // Emit real-time update
    const io = socketModule.getIO ? socketModule.getIO() : socketModule.io;
    if (io) {
      io.to(room).emit("message:new", {
        id: msg._id,
        sender: req.user._id,
        room: msg.room,
        content: msg.content,
        createdAt: msg.createdAt,
      });
    }

    // Invalidate cache for this room
    await delCache(`messages:room:${room}`);

    res.status(201).json(msg);
  } catch (err) {
    console.error("postMessage error:", err);
    res.status(500).json({ message: "Failed to post message" });
  }
};

// GET /api/messages/:room
exports.getMessagesByRoom = async (req, res) => {
  try {
    const room = req.params.room;

    // Check cache first
    const cacheKey = `messages:room:${room}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const messages = await Message.find({ room })
      .sort({ createdAt: 1 })
      .populate("sender", "name email");

    // Save to cache for faster access next time
    await setCache(cacheKey, JSON.stringify(messages));

    res.json(messages);
  } catch (err) {
    console.error("getMessagesByRoom error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};
