import { AppMiddleware } from "../AppMiddleware";
import Koa from "koa";

export class KoaMiddleware extends AppMiddleware {
  innerMiddles: Koa.Middleware[] = [];
  use(middleware: Koa.Middleware) {
    this.innerMiddles.push(middleware);
  }
  afterApp(app: Koa) {
    this.innerMiddles.forEach((middleware) => {
      app.use(middleware);
    });
  }
}
