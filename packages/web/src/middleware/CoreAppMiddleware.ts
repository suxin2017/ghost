import { MiddleWare } from "slow-core";
import log from "slow-logger";
import { App } from "..";
const logger = log("controller");

export class CoreAppMiddleware extends MiddleWare {
  afterDependencyInject(context: App) {
    console.log(context.router.routes())
    context.app.use(context.router.routes())
    context.app.listen(context.options.port, () => {
      console.log(`listen http://127.0.0.1:${context.options.port}`)
    })
  }
}
