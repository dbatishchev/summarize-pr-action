import os
import requests
from github import Github
from openai import OpenAI

def run():
    try:
        github_token = os.getenv('GITHUB_TOKEN')
        openai_api_key = os.getenv('OPENAI_API_KEY')
        repo_name = os.getenv('GITHUB_REPOSITORY')
        pr_number = os.getenv('PR_NUMBER')

        if not pr_number:
            print('No pull request number found.')
            exit(1)

        g = Github(github_token)
        repo = g.get_repo(repo_name)
        pr = repo.get_pull(int(pr_number))

        # Get the list of files changed in the PR
        files = pr.get_files()

        # Concatenate the content of all changed files
        code_content = ''
        for file in files:
            file_content = requests.get(file.raw_url).text
            code_content += file_content + '\n'

        # Set up OpenAI API
        openai = OpenAI(api_key=openai_api_key)

        # Summarize the code using OpenAI API
        response = openai.chat.completions.create(
            model='gpt-4o',
            max_tokens=150,
            messages=[
                {"role": "system", "content": "You are an expert software engineer."},
                {"role": "user", "content": f"Please provide a concise summary of the following code changes:\n\n{code_content}\n\nSummary:"}
            ]
        )

        summary = response.choices[0].message.content.strip()

        # Post the summary as a comment on the PR
        repo.create_issue_comment(pr_number, f'**PR Code Summary:**\n\n{summary}')

    except Exception as e:
        print(f'Error: {e}')
        exit(1)

if __name__ == "__main__":
    run()
