import { Core, IClass } from ".";

export class MiddleWare {
  name: any;
  beforeScanBean() {}
  beforeGenerateBean(bean: IClass, context: Core): IClass {
    return bean;
  }
  customGenerateBean(bean: IClass, context: Core): boolean {
    return false;
  }
  afterGenerateBean(instance: Object, bean: IClass, context: Core) {}
  beforeDependencyInject() {}
  afterDependencyInject(context: Core) {}
}
