import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Inspirations() {
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // 获取分类列表
  const { data: categories, isLoading: isLoadingCategories } =
    trpc.inspirations.getCategories.useQuery();

  // 获取灵感列表
  const { data: inspirations, isLoading: isLoadingInspirations } =
    trpc.inspirations.getAll.useQuery({
      category: selectedCategory === "all" ? undefined : selectedCategory,
    });

  const handleUseInspiration = (inspiration: {
    prompt: string;
    note?: string | null;
    title: string;
  }) => {
    // 将灵感信息存储到 sessionStorage，首页读取后使用
    sessionStorage.setItem("selected_inspiration_prompt", inspiration.prompt);
    if (inspiration.note) {
      sessionStorage.setItem("selected_inspiration_note", inspiration.note);
    }
    sessionStorage.setItem("selected_inspiration_title", inspiration.title);
    navigate("/");
  };

  const isLoading = isLoadingCategories || isLoadingInspirations;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="container flex items-center gap-4 py-4 px-4 sm:px-6">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">创作灵感</h1>
            <p className="text-xs text-muted-foreground">
              选择模板快速开始创作
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-[73px] z-10 bg-background border-b border-border overflow-x-auto">
        <div className="container px-4 sm:px-6">
          <div className="flex gap-2 py-3 min-w-max">
            {/* 全部分类 */}
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              全部
            </button>

            {/* 动态分类 */}
            {categories?.map(category => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === category.key
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 sm:px-6 py-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : inspirations && inspirations.length > 0 ? (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-3">
            {inspirations.map(inspiration => (
              <Card
                key={inspiration.id}
                className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow break-inside-avoid mb-3"
                onClick={() => handleUseInspiration(inspiration)}
              >
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <img
                    src={inspiration.imageUrl}
                    alt={inspiration.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                    <Button
                      size="sm"
                      className="w-full bg-white text-black hover:bg-white/90 text-xs h-7"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      使用此模板
                    </Button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2.5">
                  <h3 className="font-medium text-sm text-foreground mb-1 line-clamp-1">
                    {inspiration.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {inspiration.prompt}
                  </p>
                  {inspiration.tags && inspiration.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {inspiration.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-1.5 py-0.5 bg-muted text-[10px] text-muted-foreground rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">暂无灵感</p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedCategory === "all"
                  ? "管理员还未添加任何灵感模板"
                  : "该分类下暂无灵感模板"}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
