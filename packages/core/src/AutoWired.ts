export const AUTO_WIRED = "AUTO_WIRED";
export const AutoWired: PropertyDecorator = (target, propertyKey) => {
  Reflect.defineMetadata(propertyKey, AUTO_WIRED, target);
  Reflect.set(target, propertyKey, null)
};

export const isAutoWried = (target: Object, propertyKey: string | symbol) => {
  return Reflect.getMetadata(propertyKey, target) === AUTO_WIRED;
};
