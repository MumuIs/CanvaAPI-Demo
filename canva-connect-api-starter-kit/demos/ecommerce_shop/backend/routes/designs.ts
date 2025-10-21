import express from "express";
import { DesignService } from "@canva/connect-api-ts";
import { injectClient } from "../../../common/backend/middleware/client";
import { db } from "../database/database";

const router = express.Router();

// 应用 injectClient 中间件到所有路由
router.use((req, res, next) => injectClient(req, res, next, db));

/**
 * GET /designs/list
 * 获取用户所有设计列表
 */
router.get("/designs/list", async (req, res) => {
  console.log("GET /designs/list - 开始请求");
  try {
    const result = await DesignService.listDesigns({
      client: req.client,
    });

    console.log("List designs result:", { 
      hasError: !!result.error, 
      itemsCount: result.data?.items?.length || 0 
    });

    if (result.error) {
      console.error("List designs error:", result.error);
      return res.status(500).json({
        error: result.error.message || "Failed to list designs",
      });
    }

    const designs = result.data?.items || [];
    console.log(`返回 ${designs.length} 个设计`);
    
    return res.json({
      designs: designs,
    });
  } catch (error) {
    console.error("List designs exception:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;

