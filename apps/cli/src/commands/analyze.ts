import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import path from "path";
import { getTokenManager } from "../auth/token-manager.js";
import { extractMetadata } from "../extractors/metadata.js";
import { API_BASE_URL } from "../config.js";

export const analyzeCommand = new Command("analyze")
  .description("프로젝트 분석 실행")
  .argument("[path]", "분석할 프로젝트 경로", ".")
  .option("-n, --name <name>", "프로젝트 이름")
  .action(async (projectPath: string, options: { name?: string }) => {
    const tokenManager = getTokenManager();
    const tokens = tokenManager.getTokens();

    if (!tokens) {
      console.log(chalk.red("로그인이 필요합니다."));
      console.log(`  ${chalk.cyan("codemeant login")} 명령어로 로그인하세요.`);
      process.exit(1);
    }

    const absolutePath = path.resolve(projectPath);
    const projectName = options.name || path.basename(absolutePath);

    console.log();
    console.log(chalk.bold(`프로젝트 분석: ${projectName}`));
    console.log(chalk.gray(`경로: ${absolutePath}`));
    console.log();

    // 1. 메타데이터 추출
    const extractSpinner = ora("메타데이터 추출 중...").start();

    try {
      const metadata = await extractMetadata(absolutePath);

      extractSpinner.succeed(`메타데이터 추출 완료 (${metadata.tokenCount} 토큰)`);

      if (metadata.tokenCount > 10000) {
        console.log(chalk.yellow(`⚠️  토큰 수가 10,000을 초과합니다. 일부 데이터가 잘릴 수 있습니다.`));
      }

      // 2. 분석 요청
      const analyzeSpinner = ora("AI 분석 요청 중...").start();

      const response = await fetch(`${API_BASE_URL}/analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.access_token}`,
        },
        body: JSON.stringify({
          project_name: projectName,
          tech_stack: metadata.techStack,
          file_tree: metadata.fileTree,
          dependencies: metadata.dependencies,
          readme_content: metadata.readmeContent,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 402) {
          analyzeSpinner.fail("크레딧이 부족합니다.");
          console.log();
          console.log(`  현재 잔액: ${chalk.red("0")} 크레딧`);
          console.log(`  필요: ${chalk.yellow("5")} 크레딧`);
          console.log();
          console.log(`  ${chalk.cyan("https://codemeant.dev/credits")} 에서 충전하세요.`);
          process.exit(1);
        }
        throw new Error(error.detail || "분석 요청 실패");
      }

      const result = await response.json();
      analyzeSpinner.succeed("분석 요청 완료!");

      console.log();
      console.log(chalk.bold("분석 결과:"));
      console.log(`  ID: ${chalk.cyan(result.id)}`);
      console.log(`  상태: ${result.status}`);
      console.log();
      console.log(`  결과 확인: ${chalk.cyan(`https://codemeant.dev/analysis/${result.id}`)}`);
    } catch (error) {
      extractSpinner.fail(`분석 실패: ${error}`);
      process.exit(1);
    }
  });
