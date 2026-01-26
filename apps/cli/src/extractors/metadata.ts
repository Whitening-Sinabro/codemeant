import fs from "fs/promises";
import path from "path";
import ignore from "ignore";

interface Metadata {
  techStack: TechStack;
  fileTree: FileTree;
  dependencies: Dependencies;
  readmeContent: string | null;
  tokenCount: number;
}

interface TechStack {
  languages: string[];
  frameworks: string[];
  databases: string[];
}

interface FileTree {
  name: string;
  type: "directory" | "file";
  children?: FileTree[];
}

interface Dependencies {
  npm?: Record<string, string>;
  python?: string[];
}

const MAX_DEPTH = 3;
const MAX_TOKEN_ESTIMATE = 10000;

export async function extractMetadata(projectPath: string): Promise<Metadata> {
  // .gitignore 로드
  const ig = ignore();
  try {
    const gitignoreContent = await fs.readFile(path.join(projectPath, ".gitignore"), "utf-8");
    ig.add(gitignoreContent);
  } catch {
    // .gitignore 없음
  }

  // 기본 무시 패턴
  ig.add(["node_modules", ".git", ".next", "dist", "build", "__pycache__", ".venv", "venv"]);

  // 파일 트리 추출
  const fileTree = await buildFileTree(projectPath, projectPath, ig, 0);

  // 의존성 추출
  const dependencies = await extractDependencies(projectPath);

  // README 추출
  const readmeContent = await extractReadme(projectPath);

  // 기술 스택 감지
  const techStack = detectTechStack(fileTree, dependencies);

  // 토큰 수 추정 (대략 4문자 = 1토큰)
  const jsonStr = JSON.stringify({ techStack, fileTree, dependencies, readmeContent });
  const tokenCount = Math.ceil(jsonStr.length / 4);

  return {
    techStack,
    fileTree,
    dependencies,
    readmeContent: tokenCount > MAX_TOKEN_ESTIMATE ? truncateReadme(readmeContent) : readmeContent,
    tokenCount: Math.min(tokenCount, MAX_TOKEN_ESTIMATE),
  };
}

async function buildFileTree(
  basePath: string,
  currentPath: string,
  ig: ignore.Ignore,
  depth: number
): Promise<FileTree> {
  const name = path.basename(currentPath);
  const relativePath = path.relative(basePath, currentPath);

  if (depth > 0 && ig.ignores(relativePath)) {
    return { name, type: "file" }; // 무시됨
  }

  const stats = await fs.stat(currentPath);

  if (!stats.isDirectory()) {
    return { name, type: "file" };
  }

  if (depth >= MAX_DEPTH) {
    return { name, type: "directory", children: [{ name: "...", type: "file" }] };
  }

  const entries = await fs.readdir(currentPath);
  const children: FileTree[] = [];

  for (const entry of entries.slice(0, 50)) {
    // 최대 50개
    const entryPath = path.join(currentPath, entry);
    const entryRelative = path.relative(basePath, entryPath);

    if (ig.ignores(entryRelative)) continue;

    children.push(await buildFileTree(basePath, entryPath, ig, depth + 1));
  }

  return { name, type: "directory", children };
}

async function extractDependencies(projectPath: string): Promise<Dependencies> {
  const deps: Dependencies = {};

  // package.json
  try {
    const pkgJson = JSON.parse(await fs.readFile(path.join(projectPath, "package.json"), "utf-8"));
    deps.npm = {
      ...pkgJson.dependencies,
      ...pkgJson.devDependencies,
    };
  } catch {
    // package.json 없음
  }

  // requirements.txt
  try {
    const reqTxt = await fs.readFile(path.join(projectPath, "requirements.txt"), "utf-8");
    deps.python = reqTxt
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"))
      .map((line) => line.split("==")[0].split(">=")[0].trim());
  } catch {
    // requirements.txt 없음
  }

  return deps;
}

async function extractReadme(projectPath: string): Promise<string | null> {
  const readmeNames = ["README.md", "readme.md", "README.txt", "README"];

  for (const name of readmeNames) {
    try {
      const content = await fs.readFile(path.join(projectPath, name), "utf-8");
      return content.slice(0, 5000); // 최대 5000자
    } catch {
      // 파일 없음
    }
  }

  return null;
}

function detectTechStack(fileTree: FileTree, dependencies: Dependencies): TechStack {
  const languages: Set<string> = new Set();
  const frameworks: Set<string> = new Set();
  const databases: Set<string> = new Set();

  // 파일 확장자로 언어 감지
  const collectExtensions = (tree: FileTree) => {
    if (tree.type === "file") {
      const ext = path.extname(tree.name).toLowerCase();
      if ([".ts", ".tsx"].includes(ext)) languages.add("TypeScript");
      if ([".js", ".jsx"].includes(ext)) languages.add("JavaScript");
      if ([".py"].includes(ext)) languages.add("Python");
      if ([".go"].includes(ext)) languages.add("Go");
      if ([".rs"].includes(ext)) languages.add("Rust");
      if ([".java"].includes(ext)) languages.add("Java");
    }
    tree.children?.forEach(collectExtensions);
  };
  collectExtensions(fileTree);

  // npm 의존성으로 프레임워크 감지
  if (dependencies.npm) {
    const npm = dependencies.npm;
    if (npm["next"]) frameworks.add("Next.js");
    if (npm["react"]) frameworks.add("React");
    if (npm["vue"]) frameworks.add("Vue.js");
    if (npm["express"]) frameworks.add("Express");
    if (npm["fastify"]) frameworks.add("Fastify");
    if (npm["@supabase/supabase-js"]) databases.add("Supabase");
    if (npm["prisma"]) databases.add("Prisma");
    if (npm["mongoose"]) databases.add("MongoDB");
  }

  // Python 의존성으로 프레임워크 감지
  if (dependencies.python) {
    const py = dependencies.python;
    if (py.includes("fastapi")) frameworks.add("FastAPI");
    if (py.includes("django")) frameworks.add("Django");
    if (py.includes("flask")) frameworks.add("Flask");
    if (py.includes("supabase")) databases.add("Supabase");
    if (py.includes("sqlalchemy")) databases.add("SQLAlchemy");
  }

  return {
    languages: Array.from(languages),
    frameworks: Array.from(frameworks),
    databases: Array.from(databases),
  };
}

function truncateReadme(readme: string | null): string | null {
  if (!readme) return null;
  return readme.slice(0, 2000) + "\n\n... (truncated)";
}
