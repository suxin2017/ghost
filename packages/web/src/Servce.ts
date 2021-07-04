import { Bean } from "slow-core";

export const SERVICE = "SERVICE";
export const Service: ClassDecorator = (target) => {
  Reflect.defineMetadata(SERVICE, true, target);
  Bean(target);
};

export const isService = (target: Object) => {
  return Reflect.getMetadata(SERVICE, target) === true;
};
