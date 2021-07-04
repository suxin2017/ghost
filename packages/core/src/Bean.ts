export const BEAN = "BEAN";
export const Bean: ClassDecorator = (target) => {
  Reflect.defineMetadata(BEAN,true, target);
};

export const isBean = (target: Object) => {
  return Reflect.getMetadata(BEAN,target) === true;
};
