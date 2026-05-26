import imagekit from "../configs/imageKit.js";

export const generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Validate prompt input
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Prompt is required and cannot be empty",
      });
    }

    console.log(`Generating image for prompt: "${prompt}" using free AI generator...`);
    
    // Construct Pollinations AI free generator URL (high quality, no logo, random seed for uniqueness)
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.trim())}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;

    console.log("Uploading generated image to ImageKit...");

    // Upload generated image directly from the remote URL to ImageKit
    const uploadResponse = await imagekit.upload({
      file: pollinationsUrl,
      fileName: `ai_post_${Date.now()}.jpg`,
      folder: "posts",
    });

    // Generate optimized ImageKit URL with auto format/quality transformations
    const optimizedUrl = imagekit.url({
      path: uploadResponse.filePath,
      transformation: [
        { quality: "auto" },
        { format: "webp" },
        { width: "1280" },
      ],
    });

    return res.json({
      success: true,
      imageUrl: optimizedUrl,
    });
  } catch (error) {
    console.error("AI Generation Endpoint Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate image",
    });
  }
};
