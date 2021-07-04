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

export class Core {
  options: ICoreOptions;
  middleware: MiddleWare[] = [] as MiddleWare[];
  instanceMap: Map<string | symbol, Object>;
  beanMap: Map<string | symbol, Object>;

  constructor(options: ICoreOptions) {
    this.options = options;
    this.middleware = options.middleware;
    this.instanceMap = new Map<string | symbol, Object>();
    this.beanMap = new Map<string | symbol, Object>();
  }

  async init() {
    const matches = await glob(this.options.scanPath);

    logger("before scan bean");
    this.middleware.forEach((middleware) => middleware.beforeScanBean());
    console.log(this.options.scanPath, matches, process.cwd());
    matches.map((value) => {
      const modulePath = path.resolve(value.substr(0, value.length - 3));
      const module = require(modulePath);
      const bean: IClass = module.default;
      if (!bean || !isBean(bean)) {
        return;
      }

      this.beanMap.set(bean.name, bean);

      const hasCustomRegister = this.middleware.some((middleware) =>
        middleware.customGenerateBean(bean, this)
      );
      if (hasCustomRegister) {
        return;
      }
      logger("before generate bean");
      const realBean = this.middleware.reduce(
        (result, middleware) => middleware.beforeGenerateBean(result, this),
        bean
      );
      const instance = new realBean();
      this.instanceMap.set(realBean.name.toLowerCase(), instance);

      logger("after generate bean ");
      this.middleware.forEach((middleware) =>
        middleware.afterGenerateBean(instance, bean, this)
      );
    });

    logger("before dependency inject");
    this.middleware.forEach((middleware) =>
      middleware.beforeDependencyInject()
    );
    this.instanceMap.forEach((instance) => {
      const proptotype = Reflect.getPrototypeOf(instance);
      if (!proptotype) {
        return;
      }
      Reflect.ownKeys(proptotype).forEach((key) => {
        if (isAutoWried(instance, key)) {
          let mapKey = key;
          const autoInstance = this.instanceMap.get(
            mapKey.toString().toLowerCase()
          );
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
    this.middleware.forEach((middleware) =>
      middleware.afterDependencyInject(this)
    );
    logger("after dependency inject");
    return this;
  }
}
