import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { LOGIN_URL } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Upload, Settings, LogIn, X, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "hot", label: "热门", icon: "🔥" },
  { id: "product", label: "产品宣传", icon: "📦" },
  { id: "multi", label: "多图融合", icon: "🎨" },
  { id: "bg", label: "换背景", icon: "🎭" },
  { id: "remove", label: "消除/变", icon: "✨" },
];

const ASPECT_RATIOS = [
  { id: "original", label: "原始尺寸" },
  { id: "1:1", label: "1:1" },
  { id: "4:3", label: "4:3" },
  { id: "3:4", label: "3:4" },
  { id: "16:9", label: "16:9" },
  { id: "9:16", label: "9:16" },
];

const EXAMPLE_IMAGES = [
  {
    id: 1,
    title: "木鱼咖啡时光",
    subtitle: "文字设计",
    image: "bg-gradient-to-br from-amber-900 to-amber-700",
  },
  {
    id: 2,
    title: "覆盖一瞬间香气",
    subtitle: "中文海报",
    image: "bg-gradient-to-br from-pink-200 to-pink-100",
  },
  {
    id: 3,
    title: "双11海报",
    subtitle: "多图融合",
    image: "bg-gradient-to-br from-red-400 to-red-300",
  },
  {
    id: 4,
    title: "清新绿展台",
    subtitle: "产品展示",
    image: "bg-gradient-to-br from-green-400 to-green-300",
  },
  {
    id: 5,
    title: "美食创意",
    subtitle: "Fresh",
    image: "bg-gradient-to-br from-yellow-400 to-orange-400",
  },
];

export default function Home() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("hot");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("1:1");
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState(localStorage.getItem("apiKey") || "");

  // 图片上传相关状态
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // tRPC mutations
  const uploadMutation = trpc.images.uploadImage.useMutation();
  const generateMutation = trpc.images.generate.useMutation();
  const editMutation = trpc.images.edit.useMutation();

  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }

    // 检查文件大小 (限制为 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("图片大小不能超过 10MB");
      return;
    }

    setSelectedFile(file);

    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 自动上传到 Supabase
    if (!user && !loading) {
      toast.error("请先登录");
      navigate(LOGIN_URL);
      return;
    }

    if (user) {
      await uploadImageToSupabase(file);
    }
  };

  // 上传图片到 Supabase
  const uploadImageToSupabase = async (file: File) => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = (e.target?.result as string).split(",")[1];

        const result = await uploadMutation.mutateAsync({
          fileName: file.name,
          fileData: base64Data,
          mimeType: file.type,
        });

        setUploadedImageUrl(result.url);
        toast.success("图片上传成功");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("上传失败:", error);
      toast.error("图片上传失败，请重试");
    } finally {
      setIsUploading(false);
    }
  };

  // 点击上传区域
  const handleUploadClick = () => {
    if (!user && !loading) {
      toast.error("请先登录");
      navigate(LOGIN_URL);
      return;
    }
    fileInputRef.current?.click();
  };

  // 清除选中的图片
  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setUploadedImageUrl("");
    setGeneratedImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 生成商品图
  const handleGenerateClick = async () => {
    // 验证输入
    if (!apiKey) {
      toast.error("请输入 OpenRouter API Key");
      return;
    }

    if (!prompt.trim()) {
      toast.error("请输入商品描述");
      return;
    }

    // 保存 API Key
    localStorage.setItem("apiKey", apiKey);

    // 检查登录状态
    if (!user && !loading) {
      navigate(LOGIN_URL);
      return;
    }

    setIsGenerating(true);
    setGeneratedImageUrl("");

    try {
      if (uploadedImageUrl) {
        // 如果有上传的图片，使用编辑接口
        const result = await editMutation.mutateAsync({
          imageUrl: uploadedImageUrl,
          editPrompt: prompt,
          apiKey: apiKey,
        });
        setGeneratedImageUrl(result.editedImageUrl);
        toast.success("商品图生成成功!");
      } else {
        // 如果没有上传图片，使用生成接口
        const result = await generateMutation.mutateAsync({
          prompt: prompt,
          apiKey: apiKey,
        });
        setGeneratedImageUrl(result.imageUrl);
        toast.success("商品图生成成功!");
      }
    } catch (error: any) {
      console.error("生成失败:", error);
      toast.error(error.message || "生成失败，请检查 API Key 或稍后重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSettingsClick = () => {
    if (!user && !loading) {
      navigate(LOGIN_URL);
      return;
    }
    navigate("/settings");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">商品图生成器</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSettingsClick}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">设置</span>
            </Button>
            {!user && !loading && (
              <Button
                size="sm"
                onClick={() => navigate(LOGIN_URL)}
                className="gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">登录</span>
              </Button>
            )}
            {user && (
              <div className="text-sm text-muted-foreground">{user.name}</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Upload Section */}
        <div className="mb-8">
          {!previewUrl ? (
            <div
              onClick={handleUploadClick}
              className="flex items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-border bg-card/50 hover:bg-card/80 transition-colors cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  <span className="text-lg text-foreground">上传中...</span>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-primary" />
                  <span className="text-lg text-foreground">选择照片</span>
                </>
              )}
            </div>
          ) : (
            <div className="relative rounded-2xl border-2 border-border overflow-hidden">
              <img
                src={previewUrl}
                alt="预览"
                className="w-full h-auto max-h-96 object-contain bg-card"
              />
              <button
                onClick={handleClearImage}
                className="absolute top-2 right-2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {uploadedImageUrl && (
                <div className="absolute bottom-2 left-2 px-3 py-1 rounded-full bg-green-500/80 text-white text-sm">
                  ✓ 已上传
                </div>
              )}
            </div>
          )}
        </div>

        {/* Generated Image Result */}
        {generatedImageUrl && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">生成结果</h3>
            <div className="relative rounded-2xl border-2 border-primary overflow-hidden">
              <img
                src={generatedImageUrl}
                alt="生成的商品图"
                className="w-full h-auto max-h-96 object-contain bg-card"
              />
              <a
                href={generatedImageUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-2 right-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                下载图片
              </a>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border text-foreground hover:border-primary/50"
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Example Images Grid */}
        <div className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {EXAMPLE_IMAGES.map((img) => (
              <div
                key={img.id}
                className="group relative rounded-xl overflow-hidden aspect-square cursor-pointer"
              >
                <div className={`w-full h-full ${img.image} flex items-end p-3`}>
                  <div className="text-white">
                    <div className="font-semibold text-sm">{img.title}</div>
                    <div className="text-xs opacity-80">{img.subtitle}</div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* Aspect Ratio Selection */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.id}
                onClick={() => setSelectedAspectRatio(ratio.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg border-2 transition-all whitespace-nowrap text-sm ${
                  selectedAspectRatio === ratio.id
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border text-foreground hover:border-primary/50"
                }`}
              >
                {ratio.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-8 space-y-4">
          {/* API Key Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              OpenRouter API Key
            </label>
            <Input
              type="password"
              placeholder="sk-or-v1-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-card border-border"
            />
            <p className="text-xs text-muted-foreground mt-2">
              获取地址: <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://openrouter.ai/keys</a>
            </p>
          </div>

          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              商品描述或选择上面的模板
            </label>
            <Textarea
              placeholder="请输入您的想法或选择上面的模板&#10;例如：白色帆布鞋，简约风格，白色背景，产品摄影..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-card border-border min-h-32 resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2 border-border"
            onClick={() => setPrompt("")}
            disabled={isGenerating}
          >
            <span>优化提示词</span>
          </Button>
          <Button
            className="flex-1 gap-2 bg-primary hover:bg-primary/90"
            onClick={handleGenerateClick}
            disabled={isGenerating || isUploading}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>生成中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>生成商品图</span>
              </>
            )}
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>由 OpenRouter AI 提供支持</p>
          <p className="mt-1">使用 Google Gemini 2.5 Flash 模型</p>
        </div>
      </div>
    </div>
  );
}
