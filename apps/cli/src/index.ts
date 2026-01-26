#!/usr/bin/env node
import { Command } from "commander";
import { loginCommand } from "./commands/login.js";
import { analyzeCommand } from "./commands/analyze.js";
import { creditsCommand } from "./commands/credits.js";

const program = new Command();

program
  .name("codemeant")
  .description("바이브코더를 위한 프로젝트 가치 분석 도구")
  .version("0.1.0");

program.addCommand(loginCommand);
program.addCommand(analyzeCommand);
program.addCommand(creditsCommand);

program.parse();
