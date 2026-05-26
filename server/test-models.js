import "dotenv/config";
import imagekit from "./configs/imageKit.js";

const run = async () => {
  try {
    const prompt = "A cute cat wearing a spacesuit, digital art";
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;

    console.log("Sending Pollinations AI URL to ImageKit for upload...");
    console.log("URL:", pollinationsUrl);

    const uploadResponse = await imagekit.upload({
      file: pollinationsUrl,
      fileName: `test_ai_post_${Date.now()}.jpg`,
      folder: "posts",
    });

    console.log("Upload Success! ImageKit URL:");
    console.log(uploadResponse.url);

  } catch (error) {
    console.error("Test Upload failed:", error);
  }
};

run();
