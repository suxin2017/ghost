# slow

slow is a web library for me.


# quick start

```bash
lerna bootstrap
# then
npm run build # or npm run dev
# then
cd packages/example
npm run start
```

You will see the log
```

> slow-example@0.0.2-demo.0 start
> DEBUG=slow* ts-node ./src/index.ts

创建数据库连接
数据库连接创建完成
  slow:core before scan bean +0ms
{src/controller/*.ts,src/service/*.ts,src/entity/*.ts} [
  'src/controller/Hello.controller.ts',
  'src/entity/User.ts',
  'src/service/Hello.service.ts'
] /Users/xw/toy/ghost/packages/example
  slow:core before generate bean +73ms
  slow:core after generate bean  +0ms
  slow:controller 注册路由 get /hello hello +0ms
注册数据层 UserRepository
  slow:core before generate bean +1ms
  slow:core after generate bean  +1ms
  slow:core before dependency inject +0ms
  slow:core auto inject HelloWorldService => HelloWorldController.helloWorldService +0ms
  slow:core auto inject Repository => HelloWorldController.userRepository +0ms
  slow:core after dependency inject +1ms
listen http://127.0.0.1:1234
```

you can send a request to server.

curl http://127.0.0.1:1234/rest/hello
```bash
{"firstName":"123","lastName":"last","age":123,"id":3}
```

enjoy coding!!!
