import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";


export const getAllAnotherUsers = async (req, res) => {
  let logInUserId = req.user._id;

  try {
    const filteredUsers = await User.find({ _id: { $ne: logInUserId } }).select(
      "-password"
    );
    return res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("GetAllAnotherUsers Controller Error: ", error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const getMessages = async (req, res) => {
  let anotherUserId = req.params.id;
  let currentUserId = req.user._id;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: anotherUserId },
        { senderId: anotherUserId, receiverId: currentUserId }
      ]
    });

    return res.status(200).json(messages);
  } catch (error) {
    console.log("GetMessages Controller Error: ", error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const sendMessage = async (req, res) => {
  const { text, image } = req.body;

  const receiverId =  req.params.id;
  const senderId = req.user._id;

  console.log(senderId, receiverId);

  try {
    let imageUrl;

    if (image) {
      // Upload image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const message = await Message.create({
        senderId,
        receiverId,
        text,
        image: imageUrl
    });

    // Real-time functionality
    const receiverSocketId = getReceiverSocketId(receiverId);

    if(receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    return res.status(201).json(message);

  } catch (error) {
    console.log("SendMessage Controller Error: ", error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};
