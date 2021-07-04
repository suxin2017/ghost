import "reflect-metadata";
export * from "./AutoWired";
export * from "./MiddleWare";
export * from "./Core";
export * from "./Bean";

export interface IClass {
  new (): IClass;
}
