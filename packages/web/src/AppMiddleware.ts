import { MiddleWare } from "slow-core";
import Koa from 'koa'
import Router from "koa-router";

export class AppMiddleware extends MiddleWare{
	 beforeApp() { };
	 afterApp(app: Koa) { };
	 beforeRouter() { };
	 afterRouter(router: Router) { };
}