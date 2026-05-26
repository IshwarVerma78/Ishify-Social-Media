import { useState } from "react";
import { Image, X, Sparkles, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // AI Generation States
  const [showAi, setShowAi] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiImage, setAiImage] = useState(null);
  const [generating, setGenerating] = useState(false);

  const user = useSelector((state) => state.user.value);

  const { getToken } = useAuth();

  const handleSubmit = async () => {
    if (!images.length && !aiImage && !content) {
      return toast.error("Please add at least one image or text");
    }

    setLoading(true);

    const postType =
      (images.length || aiImage) && content
        ? "text_with_image"
        : (images.length || aiImage)
        ? "image"
        : "text";

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("post_type", postType);
      images.map((image) => formData.append("images", image));
      if (aiImage) {
        formData.append("image_urls", aiImage);
      }

      const { data } = await api.post("/api/post/add", formData, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        navigate("/");
      } else {
        console.log(data.message);
        throw new Error(data.message);
      }
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }

    setLoading(false);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      return toast.error("Please enter a prompt");
    }

    setGenerating(true);

    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/ai/generate-image",
        { prompt: aiPrompt },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        setAiImage(data.imageUrl);
        toast.success("Image generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate image");
      }
    } catch (error) {
      console.error("AI Generate Error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to generate image");
    } finally {
      setGenerating(false);
    }
  };

  const handleAiCancel = () => {
    setAiImage(null);
  };

  const handleAiContinue = () => {
    setShowAi(false);
    toast.success("AI image attached to post!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Create Post
          </h1>
          <p className="text-slate-600">Share your thoughts with the world</p>
        </div>

        {/* Form */}
        <div className="max-w-xl bg-white p-4 sm:p-8 sm:pb-3 rounded-xl shadow-md space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <img
              src={user.profile_picture}
              alt="profile"
              className="w-12 h-12 rounded-full shadow"
            />
            <div>
              <h2 className="font-semibold">{user.full_name}</h2>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </div>

          {/* Text Area */}
          <textarea
            className="w-full resize-none max-h-20 mt-4 text-sm outline-none placeholder-gray-400"
            placeholder="What's happening?"
            onChange={(e) => setContent(e.target.value)}
            value={content}
          />

          {/* Images */}
          {(images.length > 0 || aiImage) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {images.map((image, i) => (
                <div key={i} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="image"
                    className="h-20 rounded-md"
                  />
                  <div
                    onClick={() =>
                      setImages(images.filter((_, index) => index !== i))
                    }
                    className="absolute hidden group-hover:flex justify-center items-center top-0 right-0 bottom-0 left-0 bg-black/40 rounded-md cursor-pointer"
                  >
                    <X className="w-6 h-6 text-white" />
                  </div>
                </div>
              ))}
              {aiImage && (
                <div className="relative group">
                  <img
                    src={aiImage}
                    alt="AI Generated"
                    className="h-20 w-20 object-cover rounded-md"
                  />
                  <div
                    onClick={() => {
                      setAiImage(null);
                      setAiPrompt("");
                    }}
                    className="absolute hidden group-hover:flex justify-center items-center top-0 right-0 bottom-0 left-0 bg-black/40 rounded-md cursor-pointer"
                  >
                    <X className="w-6 h-6 text-white" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Generator Panel */}
          {showAi && (
            <div className="mt-4 p-4 border border-indigo-100 bg-indigo-50/30 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                  AI Image Generator
                </h3>
                {aiImage && (
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Image Generated
                  </span>
                )}
              </div>

              {!aiImage ? (
                <div className="space-y-3">
                  <textarea
                    className="w-full resize-none p-3 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-400 placeholder-slate-400"
                    rows="3"
                    placeholder="Describe the image you want to generate..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={generating}
                  />
                  <button
                    type="button"
                    disabled={generating || !aiPrompt.trim()}
                    onClick={handleAiGenerate}
                    className="w-full flex items-center justify-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 transition text-white font-semibold py-2.5 rounded-lg cursor-pointer"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating image...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Image
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={aiImage}
                      alt="AI Generated Preview"
                      className="w-full max-h-64 object-cover"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={generating}
                      onClick={handleAiGenerate}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-2 rounded-lg cursor-pointer border border-indigo-100 transition"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Regenerate
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleAiCancel}
                      className="flex-1 text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-2 rounded-lg cursor-pointer border border-slate-200 transition"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleAiContinue}
                      className="flex-1 text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-2 rounded-lg cursor-pointer transition shadow-sm"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-300">
            <div className="flex items-center gap-4">
              <label
                htmlFor="images"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer"
                title="Upload Image"
              >
                <Image className="size-6" />
              </label>

              <button
                type="button"
                onClick={() => setShowAi(!showAi)}
                className={`flex items-center gap-1.5 text-sm font-medium transition cursor-pointer ${
                  showAi ? "text-indigo-600 hover:text-indigo-700" : "text-gray-500 hover:text-gray-700"
                }`}
                title="Generate with AI"
              >
                <Sparkles className="size-5" />
                <span>Generate with AI</span>
              </button>
            </div>

            <input
              type="file"
              id="images"
              accept="images/*"
              hidden
              multiple
              onChange={(e) => setImages([...images, ...e.target.files])}
            />

            <button
              disabled={loading || generating}
              onClick={() =>
                toast.promise(handleSubmit(), {
                  loading: "uploading...",
                  success: <p>Post Added</p>,
                  error: <p>Post not Added</p>,
                })
              }
              className="text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white font-medium px-8 py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              Publish Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
