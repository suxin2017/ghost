import "reflect-metadata";
import { MiddleWare, Core, ICoreOptions } from "slow-core";
import { ControllerMiddleware } from "./middleware/ControllerMiddleware";
import Koa from "koa";
import Application from "koa";
import { CoreAppMiddleware } from "./middleware/CoreAppMiddleware";
import Router from "koa-router";
import { routerCatchMiddleware } from "./Router";
import { AppMiddleware } from "./AppMiddleware";

export interface IAppOptions extends ICoreOptions {
  port: number;
  middleware: AppMiddleware[];
}

export interface IAppConfig {
  routerConfig?: Router.IRouterOptions;
}

export class App extends Core {
  app!: Application;
  options: IAppOptions;
  router!: Router;
  config: IAppConfig;

  static async build(options: IAppOptions, config: IAppConfig) {
    return await new App(options, config).init();
  }

  constructor(options: IAppOptions, config: IAppConfig) {
    super({
      scanPath: options.scanPath,
      middleware: ([] as MiddleWare[]).concat(
        /** core middleware */
        [new ControllerMiddleware(), new CoreAppMiddleware()],
        /** other middleware */
        options.middleware
      ),
    });
    this.options = options;
    this.config = config;
  }

  async init() {
    await Promise.all(
      this.options.middleware.map((middleware) => middleware.beforeApp())
    );

    this.app = new Koa();
    await Promise.all(
      this.options.middleware.map((middleware) => middleware.afterApp(this.app))
    );
    await Promise.all(
      this.options.middleware.map((middleware) => middleware.beforeRouter())
    );
    this.router = new Router(this.config.routerConfig);
    this.router.use(routerCatchMiddleware);
    await Promise.all(
      this.options.middleware.map((middleware) =>
        middleware.afterRouter(this.router)
      )
    );
    super.init();
    return this;
  }
}

export * from "./Controller";
export * from "./Service";
export * from "./AppMiddleware";
export * from "./middleware/KoaMiddleware";

export * from "slow-core";
