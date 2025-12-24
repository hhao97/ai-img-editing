import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Zap, Loader2, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Generate() {
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Load API Key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem("openrouter_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const generateMutation = trpc.images.generate.useMutation();

  const handleGenerate = async () => {
    if (!apiKey) {
      toast.error("请先在设置中保存 API Key");
      return;
    }

    if (!prompt.trim()) {
      toast.error("请输入商品描述");
      return;
    }

    if (prompt.length > 500) {
      toast.error("描述不能超过 500 个字符");
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateMutation.mutateAsync({
        prompt: prompt.trim(),
        apiKey,
      });

      setGeneratedImage(result.imageUrl);
      toast.success("图片生成成功！");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "生成失败，请检查 API Key 是否正确";
      toast.error(errorMessage);
      console.error("Generation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `product-${Date.now()}.jpg`;
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
          <h1 className="text-xl font-bold text-foreground">生成商品图</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6 max-w-md mx-auto">
        <Card className="p-6">
          <div className="space-y-4">
            {/* Input Section */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                商品描述
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：高级皮革手提包，黑色，简约设计，适合商务场景"
                className="min-h-24 resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {prompt.length}/500
              </p>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim() || !apiKey}
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-lg font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  生成图片
                </>
              )}
            </Button>

            {/* API Key Warning */}
            {!apiKey && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  ⚠️ 未检测到 API Key，请先在设置中保存
                </p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="p-6 bg-muted rounded-lg text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                <p className="text-sm text-muted-foreground">
                  正在生成图片，请稍候...
                </p>
              </div>
            )}

            {/* Generated Image */}
            {generatedImage && !isLoading && (
              <div className="space-y-3">
                <div className="bg-muted rounded-lg overflow-hidden">
                  <img
                    src={generatedImage}
                    alt="Generated product"
                    className="w-full h-auto"
                  />
                </div>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载图片
                </Button>
              </div>
            )}

            {/* Tips */}
            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold text-foreground mb-2 text-sm">
                💡 提示
              </h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 详细的描述能生成更好的图片</li>
                <li>• 包括颜色、材质、风格等细节</li>
                <li>• 生成可能需要 10-30 秒</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
