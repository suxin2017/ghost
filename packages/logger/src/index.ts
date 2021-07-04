import * as debug from "debug";

const logger = (namespace: string) => {
  return debug("slow").extend(namespace);
};

export default logger;
