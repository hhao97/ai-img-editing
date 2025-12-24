import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Upload, Loader2, Download, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Edit() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load API Key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem("openrouter_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const uploadMutation = trpc.images.uploadImage.useMutation();
  const editMutation = trpc.images.edit.useMutation();

  const handleImageSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("图片大小不能超过 10MB");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setOriginalImage(base64);

        // Upload to S3
        try {
          const base64Data = base64.split(",")[1];
          const result = await uploadMutation.mutateAsync({
            fileName: file.name,
            fileData: base64Data,
            mimeType: file.type,
          });
          setOriginalImage(result.url);
          toast.success("图片已上传");
        } catch (error) {
          toast.error("上传失败");
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("处理图片失败");
    }
  };

  const handleEdit = async () => {
    if (!apiKey) {
      toast.error("请先在个人中心保存 API Key");
      return;
    }

    if (!originalImage) {
      toast.error("请先上传图片");
      return;
    }

    if (!editPrompt.trim()) {
      toast.error("请输入编辑要求");
      return;
    }

    setIsLoading(true);
    try {
      const result = await editMutation.mutateAsync({
        imageUrl: originalImage,
        editPrompt: editPrompt.trim(),
        apiKey,
      });

      setEditedImage(result.editedImageUrl);
      toast.success("图片编辑成功！");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "编辑失败";
      toast.error(errorMessage);
      console.error("Edit error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("图片已下载");
    } catch (error) {
      toast.error("下载失败");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-border">
        <div className="container flex items-center gap-4 py-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">编辑图片</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6 max-w-md mx-auto">
        <Card className="p-6">
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                原始图片
              </label>

              {originalImage ? (
                <div className="relative bg-muted rounded-lg overflow-hidden">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-auto"
                  />
                  <button
                    onClick={() => {
                      setOriginalImage(null);
                      setEditedImage(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-8 border-2 border-dashed border-border rounded-lg hover:bg-muted transition-colors flex flex-col items-center gap-2"
                  disabled={isLoading}
                >
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    点击上传图片
                  </span>
                  <span className="text-xs text-muted-foreground">
                    或拖拽到此处
                  </span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageSelect(file);
                }}
                className="hidden"
              />
            </div>

            {/* Edit Prompt */}
            {originalImage && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    编辑要求
                  </label>
                  <Textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="例如：将背景改为白色，增加产品的亮度"
                    className="min-h-20 resize-none"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {editPrompt.length}/500
                  </p>
                </div>

                {/* Edit Button */}
                <Button
                  onClick={handleEdit}
                  disabled={isLoading || !editPrompt.trim() || !apiKey}
                  className="w-full bg-accent hover:bg-accent/90 text-white h-12 rounded-lg font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      编辑中...
                    </>
                  ) : (
                    "编辑图片"
                  )}
                </Button>
              </>
            )}

            {/* API Key Warning */}
            {!apiKey && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  ⚠️ 未检测到 API Key，请先在个人中心保存
                </p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="p-6 bg-muted rounded-lg text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-accent" />
                <p className="text-sm text-muted-foreground">
                  正在编辑图片，请稍候...
                </p>
              </div>
            )}

            {/* Edited Image */}
            {editedImage && !isLoading && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground text-sm">编辑结果</h3>
                <div className="bg-muted rounded-lg overflow-hidden">
                  <img
                    src={editedImage}
                    alt="Edited product"
                    className="w-full h-auto"
                  />
                </div>
                <Button
                  onClick={() =>
                    handleDownload(editedImage, `edited-product-${Date.now()}.jpg`)
                  }
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载编辑后的图片
                </Button>
              </div>
            )}

            {/* Tips */}
            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold text-foreground mb-2 text-sm">
                💡 提示
              </h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 支持 JPG、PNG 等常见格式</li>
                <li>• 文件大小不超过 10MB</li>
                <li>• 详细描述编辑需求能获得更好效果</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
