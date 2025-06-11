import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summariseCode } from "./gemini";
import { db } from "@/server/db";
import { Octokit } from "octokit";

export async function getFileCount(
  githubOwner: string,
  githubRepo: string,
  octokit: Octokit
): Promise<number> {
  const { data: repo } = await octokit.rest.repos.get({
    owner: githubOwner,
    repo: githubRepo,
  });
  const defaultBranch = repo.default_branch;

  const {
    data: {
      commit: { sha: treeSha },
    },
  } = await octokit.rest.repos.getBranch({
    owner: githubOwner,
    repo: githubRepo,
    branch: defaultBranch,
  });

  const { data: treeData } = await octokit.rest.git.getTree({
    owner: githubOwner,
    repo: githubRepo,
    tree_sha: treeSha,
    recursive: "true",
  });

  const fileCount = treeData.tree.filter((item) => item.type === "blob")
    .length;

  return fileCount;
}

export const checkCredits = async (
  githubUrl: string,
  githubToken?: string
): Promise<number> => {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN!,
  });

  const [, , , githubOwner, githubRepo] = githubUrl.split("/");
  if (!githubOwner || !githubRepo) {
    return 0;
  }

  try {
    const fileCount = await getFileCount(githubOwner, githubRepo, octokit);
    return fileCount;
  } catch (err) {
    console.error("Error counting files:", err);
    return 0;
  }
};

export const loadGithubRepo = async (
  githubUrl: string,
  githubToken?: string,
) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || process.env.GITHUB_TOKEN || "",
    branch: "main",
    ignoreFiles: [
      "package-lock.json",
      "yarn-lock",
      "pnpm-lock.yaml",
      "bun.lockb",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });
  const docs = await loader.load();
  return docs;
};

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  const docs = await loadGithubRepo(githubUrl, githubToken);
  const allEmbeddings = await generateEmbeddings(docs);
  await Promise.allSettled(
    allEmbeddings.map(async (embedding, index) => {
      if (!embedding) return;
      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          summary: embedding.summary,
          sourceCode: embedding.sourceCode,
          fileName: embedding.fileName,
          projectId,
        },
      });
      await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = ${embedding.embedding}::vector
        WHERE "id" = ${sourceCodeEmbedding.id}
        `;
    }),
  );
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const generateEmbeddings = async (docs: Document[]) => {
  const results = [];

  for (const doc of docs) {
    try {
      const summary = await summariseCode(doc);
      const embedding = await generateEmbedding(summary);
      results.push({
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        fileName: doc.metadata.source,
      });
    } catch (err) {
      console.error(`Failed for ${doc.metadata.source}:`, err);
    }
    await delay(2000);
  }

  return results;
};
