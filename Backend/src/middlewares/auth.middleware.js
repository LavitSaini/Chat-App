import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res
        .status(400)
        .json({ message: "Unauthorized - No Token Provided!" });
    }

    const data = jwt.verify(token, process.env.JWT_SECRET);

    if (!data) {
      return res.status(400).json({ message: "Unauthorized - Invalid Token!" });
    }

    const user = await User.findById({ _id: data.userId }).select("-password");

    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.message.includes("jwt malformed")) {
      return res.status(400).json({ message: "Unauthorized - Invalid Token!" });
    } else {
      console.log("Authentication Middleware Error: ", error);
      return res.status(500).json({ message: "Internal Server Error!" });
    }
  }
};
