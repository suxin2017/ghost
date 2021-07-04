import { Bean } from "slow-web";

export const DAO = "DAO";
export const Dao: ClassDecorator = (target) => {
  Reflect.defineMetadata(DAO, true, target);
  Bean(target)
};

export const isDao = (target: Object) => {
  return Reflect.getMetadata(DAO, target) === true;
};
