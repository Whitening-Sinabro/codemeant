import { Command } from "commander";
import chalk from "chalk";
import { getTokenManager } from "../auth/token-manager.js";
import { API_BASE_URL } from "../config.js";

export const creditsCommand = new Command("credits")
  .description("크레딧 잔액 조회")
  .action(async () => {
    const tokenManager = getTokenManager();
    const tokens = tokenManager.getTokens();

    if (!tokens) {
      console.log(chalk.red("로그인이 필요합니다."));
      console.log(`  ${chalk.cyan("codemeant login")} 명령어로 로그인하세요.`);
      process.exit(1);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/credits`, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("크레딧 조회 실패");
      }

      const { balance } = await response.json();

      console.log();
      console.log(chalk.bold("크레딧 잔액"));
      console.log();
      console.log(`  ${chalk.cyan.bold(balance)} 크레딧`);
      console.log();
      console.log(`  (분석 1회 = 5 크레딧)`);
      console.log();

      if (balance < 5) {
        console.log(chalk.yellow("  ⚠️  크레딧이 부족합니다."));
        console.log(`  ${chalk.cyan("https://codemeant.dev/credits")} 에서 충전하세요.`);
      }
    } catch (error) {
      console.log(chalk.red(`오류: ${error}`));
      process.exit(1);
    }
  });
