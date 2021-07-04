import { AutoWired, Controller, Get } from "slow-web";
import HelloWorldService from "../service/Hello.service";
import { getConnection, getConnectionManager, Repository } from "typeorm";
import User from "../entity/User";
@Controller()
export default class HelloWorldController {
  @AutoWired
  helloWorldService!: HelloWorldService;

  @AutoWired
  userRepository!: Repository<User>;

  @Get("hello")
  async hello() {
    return await this.userRepository.save({
      firstName: '123',
      lastName: 'last',
      age:123,
    })
  }
}
