import express from "express";
import { DesignService } from "@canva/connect-api-ts";
import { injectClient } from "../../../common/backend/middleware/inject-client";

const router = express.Router();

/**
 * GET /designs/list
 * 获取用户所有设计列表
 */
router.get("/designs/list", injectClient, async (req, res) => {
  try {
    const result = await DesignService.listDesigns({
      client: req.client,
    });

    if (result.error) {
      console.error("List designs error:", result.error);
      return res.status(500).json({
        error: result.error.message || "Failed to list designs",
      });
    }

    return res.json({
      designs: result.data.designs,
    });
  } catch (error) {
    console.error("List designs exception:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;

