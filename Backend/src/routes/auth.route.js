import {Router} from "express";
import { signup, login, logout, updateProfile, checkAuth } from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/signup', signup);

router.post('/login', login);

router.get('/logout', logout);

router.put('/update-profile', protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

export default router;