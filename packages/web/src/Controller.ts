import Koa from "koa";

import { getBody, getFile, getQuery } from "./utls/param";
import { Bean } from "slow-core";
interface IWrapperFunc extends Koa.Middleware {
  displayName?: string;
}
interface IRouterOptions {
  type: "get" | "post";
  middleware?: IWrapperFunc;
}

export const CONTROLLER = Symbol("CONTROLLER");
export const ROUTER_PREFIX = Symbol("ROUTER_PREFIX");
const QUERY_PARAMS = Symbol("QUERY_PARAMS");
const BODY_PARAMS = Symbol("BODY_PARAMS");
const FILE = "FILE";

export const Controller = (prefix: string = "") => {
  const classDecorator: ClassDecorator = (target) => {
    Reflect.defineMetadata(CONTROLLER, true, target);
    Reflect.defineMetadata(ROUTER_PREFIX, prefix, target);
    Bean(target);
  };
  return classDecorator;
};
export const isController = (target: Function) => {
  return Reflect.getMetadata(CONTROLLER, target) === true;
};

function targetCheckout(target: Object, propertyKey: string) {
  const prop = Object.getOwnPropertyDescriptor(target, propertyKey);
  if (!(prop?.value instanceof Function)) {
    throw Error(`属性 ${propertyKey} 不是方法`);
  }
}
const funcWrapper = (
  target: Object,
  propertyKey: string,
  descriptor: PropertyDescriptor
) => {
  const prop = Object.getOwnPropertyDescriptor(target, propertyKey);
  const oldFunc: Function = prop?.value;
  const argumentLength = oldFunc.length;
  const wrapper: IWrapperFunc = function (this: any, ctx) {
    let args = [];
    for (let argIndex = 0; argIndex < argumentLength; argIndex++) {
      if (Reflect.getMetadata(argIndex, target, propertyKey) === QUERY_PARAMS) {
        args[argIndex] = getQuery<any>(ctx);
      }
      if (Reflect.getMetadata(argIndex, target, propertyKey) === BODY_PARAMS) {
        args[argIndex] = getBody<any>(ctx);
      }
      if (Reflect.getMetadata(argIndex, target, propertyKey) === FILE) {
        args[argIndex] = getFile(
          ctx,
          Reflect.getMetadata(argIndex + FILE, target, propertyKey)
        );
      }
    }
    args.push(ctx);
    return oldFunc.apply(this, args);
  };
  wrapper.displayName = oldFunc.name;
  descriptor.value = wrapper;
};

export function getRouterMap(target: Object) {
  let routerMap: Map<string, IRouterOptions> = Reflect.getMetadata(
    "router",
    target
  );
  if (!routerMap) {
    routerMap = new Map();
    Reflect.defineMetadata("router", routerMap, target);
  }
  return routerMap;
}

function registerRouter(
  target: Object,
  path: string | string[] = "",
  routerOptions: IRouterOptions
) {
  const routerMap = getRouterMap(target);

  if (typeof path === "string") {
    routerMap.set(path, routerOptions);
  } else {
    path.forEach((p) => {
      routerMap.set(p, routerOptions);
    });
  }
}

interface IOptionsDescriptor {
  GET: <T>(
    path?: string | string[]
  ) => (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => void;
  POST: (
    path?: string | string[]
  ) => (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => void;
}
const optionsDescriptor = (function OptionsDescriptor(): IOptionsDescriptor {
  const options = ["GET", "POST"] as const;
  const result: IOptionsDescriptor = {} as IOptionsDescriptor;
  options.forEach((option) => {
    const optionFunc = (path?: string | string[]) => {
      return (
        target: Object,
        propertyKey: string,
        descriptor: PropertyDescriptor
      ) => {
        targetCheckout(target, propertyKey);
        funcWrapper(target, propertyKey, descriptor);
        registerRouter(target, path, {
          type: option.toLowerCase() as IRouterOptions["type"],
          middleware: descriptor.value,
        });
      };
    };
    result[option] = optionFunc;
  });
  return result;
})();

export const Get = optionsDescriptor.GET;
export const Post = optionsDescriptor.POST;

export function QueryParams(
  target: Object,
  propertyKey: string,
  parameterIndex: number
) {
  Reflect.defineMetadata(parameterIndex, QUERY_PARAMS, target, propertyKey);
}

export function BodyParams(
  target: Object,
  propertyKey: string,
  parameterIndex: number
) {
  Reflect.defineMetadata(parameterIndex, BODY_PARAMS, target, propertyKey);
}
export function BodyFile(
  fileName?: string
): (target: Object, propertyKey: string, parameterIndex: number) => void;
export function BodyFile(
  target: Object,
  propertyKey: string,
  parameterIndex: number
): void;
export function BodyFile(...argument: any[]) {
  if (arguments.length > 1) {
    const [target, propertyKey, parameterIndex] = argument as [
      target: Object,
      propertyKey: string,
      parameterIndex: number
    ];
    Reflect.defineMetadata(parameterIndex, FILE, target, propertyKey);
    Reflect.defineMetadata(parameterIndex + FILE, "file", target, propertyKey);
  }
  const [fileName] = argument as [fileName: string];
  return function (
    target: Object,
    propertyKey: string,
    parameterIndex: number
  ) {
    Reflect.defineMetadata(parameterIndex, FILE, target, propertyKey);
    Reflect.defineMetadata(
      parameterIndex + FILE,
      fileName,
      target,
      propertyKey
    );
  };
}
