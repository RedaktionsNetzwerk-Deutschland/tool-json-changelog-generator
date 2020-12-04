# GitHub Action JSON-Changelog Generator


Generates awesome JSON Changelogs from your commits and Tags.

How to use:

```yaml
- name: Changelog
  uses: RedaktionsNetzwerk-Deutschland/tool-json-changelog-generator@1
  env:
      GITHUB_WORKSPACE: $GITHUB_WORKSPACE
      CHANGELOG_SERVICE_URL: $CHANGELOG_SERVICE_URL
      CHANGELOG_SYSTEM_ID: $CHANGELOG_SYSTEM_ID
      BAIL: "Set this to any value to disable silent failing"
  # If you want to use the changelog in another action its here: steps.jsonchangelog.outputs.jsonchangelog
  id: jsonchangelog 
```
