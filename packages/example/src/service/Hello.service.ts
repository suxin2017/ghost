import { Controller, Get, Service } from "slow-web";

@Service
export default class HelloWorldService {
  hello() {
    return "hello";
  }
}
