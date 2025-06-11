import { GoogleGenerativeAI } from '@google/generative-ai'
import { Document } from '@langchain/core/documents'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-lite'
})

export const aiSummariseCommit = async (diff: string) => {
    console.log("CALLING  COMMIT SUMMARIZER");
    try {
        const response = await model.generateContent([
            `You are an expert programmer and you are trying to summarize a git diff. Reminders about the
        git diff format:
        For every file, there are a few lines of metadata like:
        \'\'\'
        diff --git a/lib/index.js b/lib/index.js
        index aadf500343..4342f 100234
        --- a/lib/index.js
        +++ b/lib/index.js
        \'\'\'
        This means that lib/index.js was modified in this commit. Note that this is only an example.
        Then there is a specifier of the lines that wre modifed.
        A line starting with + means it was added
        A line starting with - means it was deleted
        A line starting with neither means it is code given for context and better understanding. It is not part of the diff
        [...]
        EXAMPLE SUMMARY COMMENTS:
        \'\'\'
        * Raised the amount of returned recordings from \'10\' to \'100\' [packages/server/recordings_api.ts] 
        * Fixed a typo in teh github action name [.github/workflows/summariser.yml]
        * Moves the octokit initialization to a separate file [src/octolit.ts], [src/index.ts]
        * Lowered numeric tolerance for test files
        \'\'\'
        Most commmits will have less comments than this examples list
        The last does not include the file names because there were more than two relevant files in the hypothetical commit.
        Do not include parts of the example in your summary. It is given only as an example.
        Please summarize the following diff:
        \n\n${diff}`
        ])
        return response.response.text()
    }
    catch (err) {
        console.error("Error while summarising commit:", err);
        return "";
    }
}

export async function summariseCode(doc: Document) {
    try {
        const code = doc.pageContent.slice(0, 10000);
        const response = await model.generateContent([`
        You are an intelligent senior software developer who speacializes in onboarding junior software
        engineers onto projects. You are onboarding a junior software engineer and explaining to them the
        purpose of the ${doc.metadata.source} file. Here is the code \n\n ${code} \n \n
        Give a summary of no more than 100 words of the code above
    `])
        return response.response.text();
    } catch (error) {
        console.error("Error while summarising commit:", error);
        return "";
    }
}

export async function generateEmbedding(summary: string) {
    const model = genAI.getGenerativeModel({
        model: "text-embedding-004"
    })
    const result = await model.embedContent(summary);
    const embedding = result.embedding;
    return embedding.values
}

