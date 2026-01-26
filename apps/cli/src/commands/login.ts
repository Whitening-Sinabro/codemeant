import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import open from "open";
import { getTokenManager } from "../auth/token-manager.js";
import { API_BASE_URL } from "../config.js";

export const loginCommand = new Command("login")
  .description("CodeMeant에 로그인")
  .action(async () => {
    const spinner = ora("디바이스 코드 생성 중...").start();

    try {
      // 1. 디바이스 코드 요청
      const response = await fetch(`${API_BASE_URL}/auth/device`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: "codemeant-cli" }),
      });

      if (!response.ok) {
        throw new Error("디바이스 코드 생성 실패");
      }

      const { device_code, user_code, verification_uri } = await response.json();

      spinner.stop();

      console.log();
      console.log(chalk.bold("브라우저에서 인증을 완료하세요:"));
      console.log();
      console.log(`  ${chalk.cyan(verification_uri)}`);
      console.log();
      console.log(`  코드: ${chalk.yellow.bold(user_code)}`);
      console.log();

      // 2. 브라우저 열기
      await open(`${verification_uri}?code=${user_code}`);

      // 3. 폴링으로 토큰 대기
      const pollSpinner = ora("인증 대기 중...").start();

      const tokenManager = getTokenManager();
      const maxAttempts = 60; // 5분 (5초 * 60)
      let attempts = 0;

      while (attempts < maxAttempts) {
        await sleep(5000);
        attempts++;

        try {
          const tokenResponse = await fetch(`${API_BASE_URL}/auth/device/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ device_code, client_id: "codemeant-cli" }),
          });

          if (tokenResponse.ok) {
            const tokens = await tokenResponse.json();
            tokenManager.saveTokens(tokens);

            pollSpinner.succeed(chalk.green("로그인 성공!"));
            console.log();
            console.log("이제 " + chalk.cyan("codemeant analyze") + " 명령어를 사용할 수 있습니다.");
            return;
          }

          const error = await tokenResponse.json();
          if (error.detail !== "authorization_pending") {
            throw new Error(error.detail);
          }
        } catch (e) {
          // authorization_pending은 정상 상태
        }
      }

      pollSpinner.fail("인증 시간이 초과되었습니다. 다시 시도해주세요.");
    } catch (error) {
      spinner.fail(`로그인 실패: ${error}`);
      process.exit(1);
    }
  });

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
