import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Download, Trash2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

type TabType = "generate" | "edit";

export default function History() {
  const [activeTab, setActiveTab] = useState<TabType>("generate");

  const { data: generationHistory, isLoading: isLoadingGenerate } =
    trpc.images.getHistory.useQuery({ limit: 50 });

  const { data: editHistory, isLoading: isLoadingEdit } =
    trpc.images.getEditHistory.useQuery({ limit: 50 });

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
          <h1 className="text-xl font-bold text-foreground">历史记录</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-10 bg-white border-b border-border">
        <div className="container flex gap-4">
          <button
            onClick={() => setActiveTab("generate")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "generate"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            生成记录
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "edit"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            编辑记录
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6 max-w-2xl mx-auto">
        {activeTab === "generate" && (
          <div className="space-y-4">
            {isLoadingGenerate ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : generationHistory && generationHistory.length > 0 ? (
              generationHistory.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="grid grid-cols-3 gap-4 p-4">
                    {/* Image */}
                    <div className="col-span-1">
                      <img
                        src={item.imageUrl}
                        alt="Generated"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    </div>

                    {/* Info */}
                    <div className="col-span-2 flex flex-col justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {item.prompt}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownload(
                              item.imageUrl,
                              `generated-${item.id}.jpg`
                            )
                          }
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">暂无生成记录</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "edit" && (
          <div className="space-y-4">
            {isLoadingEdit ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : editHistory && editHistory.length > 0 ? (
              editHistory.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="p-4">
                    {/* Original and Edited Images */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          原始图片
                        </p>
                        <img
                          src={item.originalImageUrl}
                          alt="Original"
                          className="w-full h-20 object-cover rounded-lg"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          编辑后
                        </p>
                        <img
                          src={item.editedImageUrl}
                          alt="Edited"
                          className="w-full h-20 object-cover rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-foreground line-clamp-2">
                        {item.editPrompt}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          handleDownload(
                            item.editedImageUrl,
                            `edited-${item.id}.jpg`
                          )
                        }
                      >
                        <Download className="w-3 h-3 mr-1" />
                        下载
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">暂无编辑记录</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
