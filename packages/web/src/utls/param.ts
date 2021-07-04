import Koa from "koa";
import KoaBody from "koa-body";

export function getQuery<T>(
  ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>
) {
  return ctx.query as unknown as T;
}

export function getBody<T>(
  ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>
) {
  return ctx.request.body as unknown as T;
}

export function getFile(
  ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>,
  fileName: string = "file"
) {
  return ctx.request.files?.[fileName];
}
