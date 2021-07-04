import { Controller, Get } from "slow-web";

@Controller()
export default class HelloWorldController {
  @Get("hello")
  hello() {
    return "hello";
  }
}
