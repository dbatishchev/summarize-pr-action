import * as core from '@actions/core';
import * as github from '@actions/github';
import axios from 'axios';
import { OpenAI } from 'openai';

async function run() {
  try {
    const githubToken = core.getInput('github_token');
    const openaiApiKey = core.getInput('openai_api_key');
    const repo = github.context.repo.repo;
    const owner = github.context.repo.owner;
    const prNumber = github.context.payload.pull_request?.number;

    if (!prNumber) {
      core.setFailed('No pull request number found.');
      return;
    }

    const octokit = github.getOctokit(githubToken);

    // Get the list of files changed in the PR
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
    });

    // Concatenate the content of all changed files
    let codeContent = '';
    for (const file of files) {
      const { data: fileContent } = await axios.get(file.raw_url);
      codeContent += fileContent + '\n';
    }

    // Set up OpenAI API
    const openai = new OpenAI({
        apiKey: openaiApiKey,
    });

    // Summarize the code using OpenAI API
    const response = await openai.completions.create({
      model: 'gpt-4o',
      prompt: `You are an expert software engineer. Please provide a concise summary of the following code changes:\n\n${codeContent}\n\nSummary:`,
    });

    const summary = response.choices[0].text.trim();

    // Post the summary as a comment on the PR
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: `**PR Code Summary:**\n\n${summary}`,
    });
  } catch (error) {
    if (error instanceof Error) {
        core.setFailed(error.message);
    } else {
        core.setFailed(String(error));
    }
  }
}

run();
