Run this command to release a new version:
```bash
git tag vx.x.x
git push origin --tags
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
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Summarize PR
      uses: dbatishchev/summarize-pr-action/actions/summarize-pr@main
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        openai_api_key: ${{ secrets.OPENAI_API_KEY }}
```