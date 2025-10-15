# Canva Connect API 概览（电商 Demo 适配）

> 本概览按功能模块组织，配合 Demo 页面与典型业务流程，帮助团队快速理解“能做什么、怎么做、做完看哪里”。

## 1. 总览与关键概念
- 认证/OAuth：前端引导用户授权，获得 Access Token 后，以 `Authorization: Bearer <token>` 调用其余接口。
- 返回导航/Return Navigation：从 Canva 编辑页返回应用；编辑 URL 附带 `correlation_state`（Base64 上下文）与 `return_nav_url`。
- 资源与时序：常见流程是“上传资产 → 新建设计 → 打开编辑 → 回跳 →（可选）导出”。

## 2. 认证/Auth
- 能力：获取/刷新/撤销 Token。
- 在 Demo：首页“连接 Canva”。
- 要点：回跳时解析 `correlation_state`，定位来源与后续处理（导出/落库）。

## 3. 用户/Users
- 能力：获取当前用户/团队信息；
- 用途：展示用户信息、判断企业版能力（模板/自动填充）。

## 4. 资产/Assets（Uploads 页面）
- 能力：创建上传任务、轮询任务结果、读取资产信息（含缩略图）。
- 典型流：`createAssetUploadJob` → 轮询 `getAssetUploadJob` → 拿到 `asset.id/thumbnail`。
- Demo：上传后展示缩略图，可一键“基于素材创建设计”。

## 5. 设计/Designs（营销-单个设计/内容库）
- 能力：
  - 新建设计：
    - 预设：`{ type: 'preset', name: 'presentation'|'doc'|'whiteboard' }`
    - 自定义尺寸：`{ type: 'custom', width, height }`
    - 基于素材：`asset_id`
  - 获取设计与编辑链接：`design.urls.edit_url`
- 典型流：`createDesign` → 打开 `edit_url`（附 `correlation_state` 与 `return_nav_url`）→ 回跳处理。
- Demo：支持空白画布/商品图来源，支持预设/自定义尺寸，回跳后支持发布/导出。

## 6. 导出/Exports（回跳后或产品页导出）
- 能力：创建导出任务、轮询完成、下载文件（PNG/PDF 等）。
- 典型流：`createDesignExportJob` → 轮询 → 下载。

## 7. 品牌模板/Brand Templates（品牌模板页/批量设计）
- 能力：
  - 列表/读取模板元信息与缩略图；
  - 从模板打开编辑（`create_url`，可能丢失 return 参数）；
  - 通过 API 创建设计（可保留 return 导航，但需手动应用模板）。
- 场景：批量营销，与自动填充结合。

## 8. 自动填充/Autofill（批量生成）
- 能力：将商品/数据映射到模板占位符，批量生成设计。
- 流程：选模板集合 → 绑定数据源 → 批量创建 → 打开编辑 → 回跳处理。

## 9. Webhooks（可选）
- 能力：订阅异步事件（如导出完成）。
- 注意：需提供公网回调并校验签名。

## 10. 返回导航/Return Navigation（Return Nav 页面）
- 关键参数：
  - `correlation_state`（建议含 `originPage`、`originProductId`、`selectedTemplates` 等上下文）
  - `design_id`（回到应用后据此拉取最新设计并导出/展示）
- Demo 步骤：解析参数 → 获取设计 →（可选）导出 → 返回来源。

## 11. Scope（示例）
- 资产：`asset:read`, `asset:write`
- 设计：`design:read`, `design:write`
- 模板：`brandtemplate:meta:read`, `brandtemplate:content:read`
- 导出：`export:write`
- 用户：`profile:read`

## 12. 端到端流程样板
1) 选商品或空白画布；
2) `createDesign`（可带 `asset_id`/`design_type`）；
3) 打开 `edit_url` + `correlation_state` + `return_nav_url`；
4) 回跳后拉取设计 → `createDesignExportJob` → 下载或保存；
5) 内容库记录 `design.id/title/thumbnail/url/created_at`。

## 13. 排障要点
- 标题空值/过长：前端裁剪并提供默认值；
- 中文文件名上传：对 `name` 做 URL 编码或 Base64 元数据；
- Return 导航丢失：优先使用 API 创建设计方式；
- 401/403：检查 Token/Scope/企业版能力；
- 429：控制并发与轮询间隔。

## 14. Demo 页面映射
- Uploads：Assets 上传/缩略图/基于素材创建设计；
- Marketing - 单个设计：预设/自定义尺寸、空白/商品图、回跳发布；
- Marketing - 批量设计：品牌模板+自动填充；
- Content Library：API 创建的设计聚合与二次编辑；
- Return Nav：回跳步骤、错误提示与导出。

---
> 如需「接口对照表（Method/Path/必填/示例）」与「流程时序图」可继续补充。
