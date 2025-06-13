import { db } from '@/server/db';
import { Octokit } from 'octokit'
import axios from 'axios'
import { aiSummariseCommit } from './gemini';


export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN!
});


type Response = {
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
}

export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error("Invalid GitHub URL");
    }
    const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo
    })
    const sortedCommits = data.sort((a: any, b: any) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()) as any[]
    return sortedCommits.slice(0, 10).map((commit: any) => ({
        commitHash: commit.sha as string,
        commitMessage: commit?.commit?.message ?? "",
        commitAuthorName: commit?.commit?.author?.name ?? "",
        commitAuthorAvatar: commit?.author?.avatar_url ?? "",
        commitDate: commit?.commit?.author?.date ?? ""
    }))
}

const MAX_COMMITS = 10;
const DELAY_MS = 2000;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const pollCommits = async (projectId: string) => {
    const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
    const commitHashes = await getCommitHashes(githubUrl);
    const unprocessedCommits = await filterCommits(projectId, commitHashes);

    const toProcess = unprocessedCommits.slice(0, MAX_COMMITS);

    const summaries: string[] = [];
    for (const commit of toProcess) {
        try {
            console.log(`Summarizing commit`);
            const summary = await summariseCommit(githubUrl, commit.commitHash);
            summaries.push(summary);
        } catch (err) {
            console.error(`Failed to summarise`, err);
            summaries.push("");
        }
        await delay(DELAY_MS);
    }

    const commitRecords = toProcess.map((c, i) => ({
        projectId,
        commitHash: c.commitHash,
        commitMessage: c.commitMessage,
        commitAuthorName: c.commitAuthorName,
        commitAuthorAvatar: c.commitAuthorAvatar,
        commitDate: c.commitDate,
        summary: summaries[i] ?? ""
    }));

    const result = await db.commit.createMany({ data: commitRecords });
    return result;
};

async function summariseCommit(
    githubUrl: string,
    commitHash: string
): Promise<string> {
    const { data: diff } = await axios.get(
        `${githubUrl}/commit/${commitHash}.diff`,
        { headers: { Accept: "application/vnd.github.v3.diff" } }
    );
    return (await aiSummariseCommit(diff)) || "";
}


async function fetchProjectGithubUrl(projectId: string) {
    const project = await db.project.findUnique({
        where: { id: projectId },
        select: {
            githubUrl: true
        }
    })
    if (!project?.githubUrl) {
        throw new Error("Invalid GitHub URL");
    }
    return { project, githubUrl: project?.githubUrl }
}

async function filterCommits(projectId: string, commitHashes: Response[]) {
    const processedCommits = await db.commit.findMany({
        where: { projectId }
    })
    const unprocessedCommits = commitHashes.filter((commit) =>
        !processedCommits.some((processedCommit) => processedCommit.commitHash == commit.commitHash)
    )
    return unprocessedCommits;
}