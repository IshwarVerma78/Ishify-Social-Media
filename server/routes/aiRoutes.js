import express from "express";
import { protect } from "../middlewares/auth.js";
import { generateImage } from "../controllers/aiController.js";

const aiRouter = express.Router();

// Protected route (authenticated users only)
aiRouter.post("/generate-image", protect, generateImage);

export default aiRouter;
