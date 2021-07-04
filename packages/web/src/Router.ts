import Koa from "koa";
import Router from "koa-router";
import log from "slow-logger";
const logger = log("router");

export const routerCatchMiddleware: Router.IMiddleware = async (ctx, next) => {
  try {
    logger("handle path" + ctx.path);
    const data = await next();
    logger("handle path" + ctx.path);
    ctx.body = data || {};
  } catch (err) {
    logger("path: %s", ctx.path);
    console.error(err.message,err.stack);
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      code: ctx.status,
      message: err.message,
    };
  }
};
