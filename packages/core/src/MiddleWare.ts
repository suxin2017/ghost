import { Core, IClass } from ".";

export class MiddleWare {
  beforeScanBean() {}
  beforeGenerateBean(bean: IClass,context: Core) {
    return bean;
  }
  afterGenerateBean(instance: Object,bean: IClass,context: Core) {}
  beforeDependencyInject() {}
  afterDependencyInject(context: Core) {}
}
