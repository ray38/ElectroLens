# Information on CI Tests

## Running in a GitHub Action

## Running Tests Locally
If running on a workstation/interactive environment, change the package.json `npm test` command to xfvb-maybe instead of xfvb-run to trigger the chromedriver environment.  DO NOT COMMIT THIS CHANGE, it will break the CI environment(s).