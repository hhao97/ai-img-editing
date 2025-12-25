// 灵感分类配置
export const INSPIRATION_CATEGORIES = {
  最热: "最热",
  产品宣传: "产品宣传",
  换背景: "换背景",
  照片编辑: "照片编辑",
  照片美化: "照片美化",
  多图融合: "多图融合",
} as const;

export type InspirationCategory = keyof typeof INSPIRATION_CATEGORIES;

// 分类列表（用于 API 返回）
export const INSPIRATION_CATEGORY_LIST = Object.entries(
  INSPIRATION_CATEGORIES
).map(([key, label]) => ({
  key: key as InspirationCategory,
  label,
}));
