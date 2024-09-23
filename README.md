Run this command and commit the result:
```bash
npx tsc
```

In any repository where you want to use this action, create a workflow file, for example, .github/workflows/summarize-pr.yml with the following content:
```yaml
name: Summarize PR

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  summarize:
    runs-on: ubuntu-latest

    steps:
    - name: Summarize PR
      uses: dbatishchev/summarize-pr-action@main
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        openai_api_key: ${{ secrets.OPENAI_API_KEY }}
```