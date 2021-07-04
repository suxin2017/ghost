import { join, normalize } from "path";
import { IClass, MiddleWare } from "slow-core";
import log from "slow-logger";
import { App } from "..";
import { getRouterMap, isController, ROUTER_PREFIX } from "../Controller";
const logger = log("controller");

export class ControllerMiddleware extends MiddleWare {
  afterGenerateBean(instance: Object, bean: IClass,context:App) {
    if (isController(bean)) {
      getRouterMap(bean.prototype).forEach((option, path) => {
        if (option.middleware) {
          const prefix = Reflect.getMetadata(ROUTER_PREFIX, bean);

          const realPath = normalize(join("/", prefix, path));
          logger(
            "注册路由 %s %s %s",
            option.type,
            realPath,
            option.middleware.displayName
          );
          context.router[option.type]?.(realPath, option.middleware.bind(instance));
        }
      });
    }
  }
}
