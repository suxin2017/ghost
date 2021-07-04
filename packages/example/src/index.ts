import { App } from "slow-web";

new App({
  port: 1234,
  middleware: [],
  scanPath: `src/controller/*.ts`,
}).init();
