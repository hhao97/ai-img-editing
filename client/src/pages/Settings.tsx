import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Check } from "lucide-react";

export default function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load API Key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("openrouter_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
    }
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error("请输入 API Key");
      return;
    }

    setIsSaving(true);
    try {
      // Validate API Key format (basic check)
      if (!apiKey.startsWith("sk-") && !apiKey.startsWith("or-")) {
        toast.error("API Key 格式不正确，应以 sk- 或 or- 开头");
        setIsSaving(false);
        return;
      }

      // Save to localStorage
      localStorage.setItem("openrouter_api_key", apiKey);
      setIsSaved(true);
      toast.success("API Key 已保存");

      // Reset saved state after 2 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    } catch (error) {
      toast.error("保存失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearApiKey = () => {
    if (confirm("确定要清除 API Key 吗？")) {
      localStorage.removeItem("openrouter_api_key");
      setApiKey("");
      setIsSaved(false);
      toast.success("API Key 已清除");
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
          <h1 className="text-xl font-bold text-foreground">设置</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6 max-w-md mx-auto">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                OpenRouter API Key
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                在 <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">openrouter.ai</a> 获取您的 API Key
              </p>

              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setIsSaved(false);
                  }}
                  placeholder="sk-or-v1-..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveApiKey}
                disabled={isSaving || !apiKey.trim()}
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
              >
                {isSaving ? "保存中..." : isSaved ? "已保存" : "保存"}
              </Button>
              {apiKey && (
                <Button
                  onClick={handleClearApiKey}
                  variant="outline"
                  className="flex-1"
                >
                  清除
                </Button>
              )}
            </div>

            {isSaved && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">API Key 已安全保存</span>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold text-foreground mb-2">说明</h3>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li>• API Key 仅保存在您的浏览器本地存储中</li>
                <li>• 不会被发送到我们的服务器</li>
                <li>• 清除浏览器数据时会被删除</li>
                <li>• 请勿在公共设备上保存 API Key</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
