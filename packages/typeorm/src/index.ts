import { App, AppMiddleware, IClass } from "slow-web";
import { createConnection, ConnectionOptions, getRepository } from "typeorm";
import { isDao } from "./Dao";

export default class TypeormMiddleware extends AppMiddleware {
  options: ConnectionOptions;

  constructor(options: ConnectionOptions) {
    super();
    this.options = options;
  }

  async beforeApp() {
    console.log("创建数据库连接");
    await createConnection(this.options);
    console.log("数据库连接创建完成");
  }

  customGenerateBean(bean: IClass, context: App) {
    if (isDao(bean)) {
      console.log("注册数据层 %s", bean.name + "Repository");
      context.instanceMap.set(`${bean.name}Repository`.toLowerCase(), getRepository(bean));
      return true;
    }
    return false;
  }
}

export * from "./Dao";
