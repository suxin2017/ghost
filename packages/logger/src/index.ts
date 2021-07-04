import * as debug from "debug";

const logger = (namespace: string) => {
  console.log(debug)
  // return debug("slow").extend(namespace);
};

export default logger;
