import glob from "glob-promise";
import log from "slow-logger";
import path from "path";
import { isBean } from "./Bean";
import { isAutoWried } from "./AutoWired";
import { MiddleWare } from "./MiddleWare";
import { IClass } from ".";

const logger = log("core");

export interface ICoreOptions {
  scanPath: string;
  middleware: MiddleWare[];
}
export const InstanceMap = new Map<string | symbol, Object>();
export const BeanMap = new Map<string | symbol, Object>();

export class Core {
  options: ICoreOptions;
  middleware: MiddleWare[] = [] as MiddleWare[];

  constructor(options: ICoreOptions) {
    this.options = options;
    this.middleware = options.middleware;
  }

  async init() {
    const matches = await glob(this.options.scanPath);

    logger("before scan bean");
    this.middleware.forEach((middleware) => middleware.beforeScanBean());
    console.log(this.options.scanPath,matches,process.cwd())
    matches.map((value) => {
      const modulePath = path.resolve(value.substr(0, value.length - 3));
      const module = require(modulePath);
      const bean: IClass = module.default;
      if (!bean || !isBean(bean)) {
        return;
      }
      BeanMap.set(bean.name, bean);

      logger("before generate bean");
      const realBean = this.middleware.reduce(
        (result, middleware) => middleware.beforeGenerateBean(result,this),
        bean
      );
      const instance = new realBean();
      InstanceMap.set(realBean.name, instance);
      logger("after generate bean ");
      this.middleware.forEach((middleware) => middleware.afterGenerateBean(instance,bean,this));
    });

    logger("before dependency inject");
    this.middleware.forEach((middleware) =>
      middleware.beforeDependencyInject()
    );
    InstanceMap.forEach((instance) => {
      const proptotype = Reflect.getPrototypeOf(instance);
      if (!proptotype) {
        return;
      }
      Reflect.ownKeys(proptotype).forEach((key) => {
        if (isAutoWried(instance, key)) {
          let mapKey = key;
          const autoInstance = InstanceMap.get(mapKey);
          if (!autoInstance) {
            throw Error(`interface => ${mapKey.toString()} don't found`);
          }

          const result = Reflect.set(instance, key, autoInstance);
          if (result) {
            logger(
              "auto inject %s => %s.%s",
              autoInstance?.constructor.name,
              instance.constructor.name,
              key
            );
          } else {
            throw Error(
              `auto inject error ${autoInstance.constructor.name} => ${
                instance.constructor.name
              }.${key.toString()}`
            );
          }
        }
      });
    });
    this.middleware.forEach((middleware) => middleware.afterDependencyInject(this));
    logger("after dependency inject");
    return this;
  }
}
