import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters!" });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token
      generateToken(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
      });
    } else {
      return res.status(400).json({ message: "Invalid user data!" });
    }
  } catch (error) {
    console.log("Sign Controller Error: ", error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    generateToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Login Controller Error: ", error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logged out Successfully!" });
  } catch (error) {
    console.log("Logout Controller Error: ", error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile Pic is required!" });
    }

    if (req.user?.profilePicPublicId) {
      await cloudinary.uploader.destroy(req.user.profilePicPublicId);
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      {
        profilePic: uploadResponse.secure_url,
        profilePicPublicId: uploadResponse.public_id,
      },
      { new: true }
    ).select("-password");

    return res.status(200).json({ updatedUser });
  } catch (error) {
    console.log("Update Profile Controller Error: ", error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.log("Check Auth Controller Error: ", error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};
