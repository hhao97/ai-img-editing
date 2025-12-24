import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Download,
  Loader2,
  User,
  Image as ImageIcon,
  Edit3,
  ChevronDown,
  ChevronUp,
  LogOut,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

type TabType = "generate" | "edit";

export default function Settings() {
  const { user, logout } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("generate");
  const [showApiKeySection, setShowApiKeySection] = useState(false);

  // Load API Key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("openrouter_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const { data: generationHistory, isLoading: isLoadingGenerate } =
    trpc.images.getHistory.useQuery({ limit: 50 });

  const { data: editHistory, isLoading: isLoadingEdit } =
    trpc.images.getEditHistory.useQuery({ limit: 50 });

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error("请输入 API Key");
      return;
    }

    setIsSaving(true);
    try {
      if (!apiKey.startsWith("sk-") && !apiKey.startsWith("or-")) {
        toast.error("API Key 格式不正确，应以 sk- 或 or- 开头");
        setIsSaving(false);
        return;
      }

      localStorage.setItem("openrouter_api_key", apiKey);
      toast.success("API Key 已保存");
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
      toast.success("API Key 已清除");
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLogout = async () => {
    if (confirm("确定要退出登录吗？")) {
      try {
        await logout();
        toast.success("已退出登录");
        window.location.href = "/";
      } catch (error) {
        toast.error("退出登录失败");
      }
    }
  };

  const totalGenerated = generationHistory?.length || 0;
  const totalEdited = editHistory?.length || 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="container flex items-center justify-between py-4 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-foreground">我的</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            退出
          </Button>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* User Info Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">
                {user?.name || "未命名用户"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {user?.email || "未设置邮箱"}
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-3xl font-bold text-primary">
                <ImageIcon className="w-6 h-6" />
                {totalGenerated}
              </div>
              <p className="text-sm text-muted-foreground mt-1">生成图片</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-3xl font-bold text-purple-600">
                <Edit3 className="w-6 h-6" />
                {totalEdited}
              </div>
              <p className="text-sm text-muted-foreground mt-1">编辑图片</p>
            </div>
          </div>
        </Card>

        {/* API Key Section (Collapsible) */}
        {/*<Card className="overflow-hidden">
          <button
            onClick={() => setShowApiKeySection(!showApiKeySection)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">API Key 设置</h3>
                <p className="text-xs text-muted-foreground">
                  {apiKey ? "已配置" : "未配置"}
                </p>
              </div>
            </div>
            {showApiKeySection ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </Card>*/}

        {/* History Section */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4 px-1">
            我的作品
          </h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab("generate")}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                activeTab === "generate"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              生成记录 ({totalGenerated})
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                activeTab === "edit"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              编辑记录 ({totalEdited})
            </button>
          </div>

          {/* Generate History */}
          {activeTab === "generate" && (
            <div className="space-y-3">
              {isLoadingGenerate ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : generationHistory && generationHistory.length > 0 ? (
                generationHistory.map(item => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="flex gap-4 p-4">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt="Generated"
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                          loading="lazy"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                            {item.prompt}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(item.createdAt)}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownload(
                              item.imageUrl,
                              `generated-${item.id}.jpg`
                            )
                          }
                          className="w-fit mt-2"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          下载
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">暂无生成记录</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      去首页生成你的第一张图片吧
                    </p>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Edit History */}
          {activeTab === "edit" && (
            <div className="space-y-3">
              {isLoadingEdit ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : editHistory && editHistory.length > 0 ? (
                editHistory.map(item => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="p-4 space-y-3">
                      {/* Before/After Images */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">
                            原始图片
                          </p>
                          <img
                            src={item.originalImageUrl}
                            alt="Original"
                            className="w-full aspect-square object-cover rounded-lg"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">
                            编辑后
                          </p>
                          <img
                            src={item.editedImageUrl}
                            alt="Edited"
                            className="w-full aspect-square object-cover rounded-lg"
                            loading="lazy"
                          />
                        </div>
                      </div>

                      {/* Info */}
                      <div>
                        <p className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                          {item.editPrompt}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>

                      {/* Download Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleDownload(
                            item.editedImageUrl,
                            `edited-${item.id}.jpg`
                          )
                        }
                        className="w-full"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        下载编辑后的图片
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12">
                  <div className="text-center">
                    <Edit3 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">暂无编辑记录</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      去编辑页面创作你的第一个作品吧
                    </p>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
