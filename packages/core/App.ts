import glob from "glob-promise";
import path, { normalize } from "path";
import { createConnection, getRepository } from "typeorm";
import Koa from "koa";
import KoaBody from "koa-body";
import { router } from "./Router";
import { join } from "path";
import { getRouterMap, isController, ROUTER_PREFIX } from "./Controller";
import { isAutoWried } from "./Autowired";
import { isBean } from "./Bean";
import { isDao } from "./Dao";
import { isObject, isString } from "lodash";
import { logger } from "../common/logger";
import session from "koa-session";

function camelCase(str: string) {
  if (str.length > 1) {
    str = str.slice(0, 1).toUpperCase() + str.slice(1);
  }
  return str;
}

interface IAppOptions {
  port: number;
  controllerPath: string;
  servicePath: string;
  daoPath: string;
}

export class App {
  static InstanceMap = new Map<string | symbol, Object>();
  static BeanMap = new Map<string | symbol, Object>();

  options: IAppOptions;

  constructor(options: IAppOptions) {
    this.options = options;
  }

  async init() {
    const matches = await glob(
      `{${[
        this.options.controllerPath,
        this.options.servicePath,
        this.options.daoPath,
      ].join(",")}}`
    );

    logger.profile("创建数据库链接");
    await createConnection();
    logger.profile("创建数据库链接");

    logger.profile("启动服务");
    matches.map((value) => {
      const modulePath = path.resolve(value.substr(0, value.length - 3));
      const module = require(modulePath);
      const bean: new () => Object = module.default;
      if (!bean || !isObject(bean)) {
        return;
      }

      if (isBean(bean)) {
        logger.debug("注册实例 %s", value);
        const instance = new bean();
        App.InstanceMap.set(bean.name, instance);
        App.BeanMap.set(bean.name, bean);
        if (isController(bean)) {
          getRouterMap(bean.prototype).forEach((option, path) => {
            if (option.middleware) {
              const prefix = Reflect.getMetadata(ROUTER_PREFIX, bean);

              const realPath = normalize(join("/", prefix, path));
              logger.debug(
                "注册路由 %s %s %s",
                option.type,
                realPath,
                option.middleware.displayName
              );
              router[option.type]?.(realPath, option.middleware.bind(instance));
            }
          });
        }
      }
      if (isDao(bean)) {
        logger.debug("注册数据层 %s", bean.name + "Repository");
        App.InstanceMap.set(bean.name + "Repository", getRepository(bean));
      }
    });

    App.InstanceMap.forEach((instance) => {
      const proptotype = Reflect.getPrototypeOf(instance);
      if (!proptotype) {
        return;
      }
      Reflect.ownKeys(proptotype).forEach((key) => {
        if (isAutoWried(instance, key)) {
          let mapKey = key;
          if (isString(mapKey)) {
            mapKey = camelCase(mapKey);
          }
          const autoInstance = App.InstanceMap.get(mapKey);
          if (!autoInstance) {
            throw Error(`实例 => ${mapKey.toString()} 未找到`);
          }

          const result = Reflect.set(instance, key, autoInstance);
          if (result) {
            logger.debug(
              "自动注入 %s => %s.%s",
              autoInstance?.constructor.name,
              instance.constructor.name,
              key
            );
          } else {
            logger.debug(
              "注入失败 %s => %s.%s",
              autoInstance?.constructor.name,
              instance.constructor.name,
              key
            );
          }
        }
      });
    });
    const app = new Koa();
    app.keys = ["some secret hurr"];

    app.use(
      KoaBody({
        multipart: true,
      })
    );
    app.use(session(app));

    app.use(router.routes());

    app.listen(this.options.port, () => {
      console.log(`
 _______             _______  _______  _______ _________ _        _______
(       )|\\     /|  (  ____ \\(  ____ )(  ____ )\\__   __/( (    /|(  ____ \\
| () () |( \\   / )  | (    \\/| (    )|| (    )|   ) (   |  \\  ( || (    \\/
| || || | \\ (_) /   | (_____ | (____)|| (____)|   | |   |   \\ | || |      
| |(_)| |  \\   /    (_____  )|  _____)|     __)   | |   | (\\ \\) || | ____ 
| |   | |   ) (           ) || (      | (\\ (      | |   | | \\   || | \\_  )
| )   ( |   | |     /\\____) || )      | ) \\ \\_____) (___| )  \\  || (___) |
|/     \\|   \\_/     \\_______)|/       |/   \\__/\\_______/|/    )_)(_______)
       `);
      logger.profile("启动服务");
      logger.info("🚀 http://localhost:%s", this.options.port);
    });

    return app;
  }

  getInstance(name: string) {
    const instance = App.InstanceMap.get(name);
    if (!instance) {
      throw Error("实例未找到");
    }
    return instance;
  }
}
