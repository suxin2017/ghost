import Router from "koa-router";
import debug from "debug";
import { logger } from "../common/logger";
import sso from "./sso";

const router = new Router();
router.prefix('/rest');
router.use(sso())
router.use(async (ctx, next) => {
  try {
    logger.info('userinfo %j',ctx.session?.userInfo)

    logger.profile('handle path' + ctx.path)
    const data = await next();
    logger.profile('handle path' + ctx.path)
    ctx.body = data || {}
  } catch (err) {
    logger.error('path: %s',ctx.path)
    logger.error(err);
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      code: ctx.status,
      message: err.message,
    };
  }
});


router.get("/", (ctx) => {
  // 健康检测
  return "ok";
});

export { router };
