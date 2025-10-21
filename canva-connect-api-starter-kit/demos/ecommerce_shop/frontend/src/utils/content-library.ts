import type { Design } from "@canva/connect-api-ts/types.gen";

export type SavedDesign = {
  id: string;
  title: string;
  editUrl: string;
  createdAt: number;
  thumb?: string;
};

const STORAGE_KEY = "content_library_designs";
const MAX_DESIGNS = 100;

/**
 * 将设计保存到内容库（localStorage）
 */
export function saveDesignToContentLibrary(design: Design): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: SavedDesign[] = raw ? JSON.parse(raw) : [];
    
    // 检查是否已存在（避免重复）
    if (list.some(d => d.id === design.id)) {
      return;
    }
    
    // 添加到列表开头
    list.unshift({
      id: design.id,
      title: design.title || "Untitled",
      editUrl: design.urls.edit_url,
      createdAt: Date.now(),
      thumb: design.thumbnail?.url,
    });
    
    // 限制最大数量
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_DESIGNS)));
  } catch (error) {
    console.error("Failed to save design to content library:", error);
  }
}

/**
 * 批量保存设计到内容库
 */
export function saveDesignsToContentLibrary(designs: Design[]): void {
  designs.forEach(design => saveDesignToContentLibrary(design));
}

/**
 * 从内容库读取所有设计
 */
export function loadDesignsFromContentLibrary(): SavedDesign[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * 清空内容库
 */
export function clearContentLibrary(): void {
  localStorage.removeItem(STORAGE_KEY);
}

