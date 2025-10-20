import express from "express";
import { checkAuth, login, Signup, updateProfile } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

import cloudinary from "../lib/cloudinary.js";

const userRouter = express.Router();


userRouter.post("/signup", Signup);
userRouter.post("/login", login);
// userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.patch("/update-profile", protectRoute, upload.single("profilePic"), updateProfile);
userRouter.get("/check", protectRoute, checkAuth);
// userRouter.put("/update", protectRoute, upload.single("profilePic"), updateProfile);


export default userRouter;  