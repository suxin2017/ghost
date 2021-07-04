import "reflect-metadata";
import { MiddleWare, Core, ICoreOptions } from "slow-core";
import { ControllerMiddleware } from "./middleware/ControllerMiddleware";
import Koa from "koa";
import Application from "koa";
import { AppMiddleware } from "./middleware/AppMiddleware";
import Router from "koa-router";

export interface IAppOptions extends ICoreOptions {
  port: number;
}

export interface IAppConfig{
  routerConfig?: Router.IRouterOptions;
}

export class App extends Core {
  app: Application;
  options: IAppOptions;
  router: Router;

  constructor(options: IAppOptions,config: IAppConfig) {
    super({
      scanPath: options.scanPath,
      middleware: ([] as MiddleWare[]).concat(
        /** core middleware */
        [new ControllerMiddleware(), new AppMiddleware()],
        /** other middleware */
        options.middleware
      ),
    });
    this.options = options;
    this.app = new Koa();
    this.router = new Router(config.routerConfig);
  }
}

export * from "./Controller";
