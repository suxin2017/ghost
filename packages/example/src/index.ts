import { App } from "slow-web";
import TypeormMiddleware from "slow-typeorm";

const app = App.build(
  {
    port: 1234,
    middleware: [
      new TypeormMiddleware({
        type: "sqlite",
        database: "database.sqlite",
        synchronize: true,
        logging: false,
        entities: ["src/entity/**/*.ts"],
        migrations: ["src/migration/**/*.ts"],
        subscribers: ["src/subscriber/**/*.ts"],
        cli: {
          entitiesDir: "src/entity",
          migrationsDir: "src/migration",
          subscribersDir: "src/subscriber",
        },
      }),
    ],
    scanPath: `{src/controller/*.ts,src/service/*.ts,src/entity/*.ts}`,
  },
  {
    routerConfig: {
      prefix: "/rest",
    },
  }
);
