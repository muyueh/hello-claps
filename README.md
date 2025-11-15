# hello-claps

```mermaid
gitGraph LR
  commit id: "Initial commit"
  commit id: "docs: expand README with clasp workflow"
  commit id: "Add Apps Script project scaffolding"
  commit id: "Set up clasp npm automation"
  branch main
  checkout main
  commit id: "Merge pull request #1"
  commit id: "Merge pull request #2"
  commit id: "Merge pull request #3"
  branch work
  checkout work
  commit id: "docs: add clasp credential troubleshooting"
  commit id: "chore: rebind clasp project"
```

```mermaid
stateDiagram-v2
  [*] --> LoggedOut
  LoggedOut --> LoggedIn: npm run login
  LoggedIn --> Synced: npm run pull
  Synced --> ReadyToDeploy: npm run push
  ReadyToDeploy --> Deployed: npm run deploy
  Deployed --> Synced: iterate on scripts
  Synced --> LoginError: push without credentials
  LoginError --> LoggedIn: npm run login --creds <file>
  ReadyToDeploy --> PermissionError: scriptId access denied
  PermissionError --> Synced: share script or update scriptId
```

```mermaid
sequenceDiagram
  participant Dev as Developer
  participant NPM as npm Scripts
  participant Clasp as @google/clasp CLI
  participant Owner as Script Owner
  Dev->>NPM: npm run login (or -- --creds)
  NPM->>Clasp: clasp login
  Clasp-->>Dev: Authenticated?
  alt Credentials missing
    Clasp-->>Dev: No credentials found
    Dev->>NPM: npm run login -- --creds credentials.json
    NPM->>Clasp: clasp login --creds
  end
  Dev->>NPM: npm run push
  NPM->>Clasp: clasp push (local project)
  alt Lacking permission
    Clasp-->>Dev: The caller does not have permission
    Dev-->>Owner: Request editor access or new Script ID
    Owner-->>Clasp: Share Apps Script project
  else Deployment succeeds
    Clasp-->>Dev: Deployment status
  end
  Dev->>NPM: npm run open
  NPM->>Clasp: clasp open (Apps Script editor)
```

```mermaid
flowchart LR
  subgraph Developer
    D[Local Workspace]
    F[.clasp.json bound to 1t9viI7vAVlA_xmTFzcjB1N3RnRvWRu_lIUHybJ9BW4fgehTSz-rNREk5]
    S[npm scripts]
    C[Credential Store]
  end
  subgraph Google
    G[Apps Script Project]
    O[Project Owner]
  end
  D --> F --> S
  S --> C
  C --> S
  S --> G
  O --> G
  G --> O
```

```mermaid
flowchart LR
  subgraph Developer
    direction TB
    A1[Update Apps Script files locally]
    A2[Confirm .clasp.json scriptId matches target project]
    A3[Run npm run push]
    A4[Re-authenticate if prompted]
  end
  subgraph Frontend
    direction TB
    B1[Review deployment status]
    B2[Open editor via npm run open]
  end
  subgraph Backend
    direction TB
    C1[Receive clasp push]
    C2[Validate editor permissions]
    C3[Create deployments]
    C4[Reject unauthorized pushes]
  end
  subgraph ScriptOwner
    direction TB
    D1[Share project with collaborating accounts]
  end
  A1 --> A2 --> A3 --> B1 --> B2 --> C1 --> C3
  A3 --> A4 --> C4
  D1 --> C2
  C2 --> C3
```

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Verify that `.clasp.json` points at the intended Apps Script project. The current configuration is bound to Script ID `1t9viI7vAVlA_xmTFzcjB1N3RnRvWRu_lIUHybJ9BW4fgehTSz-rNREk5`.

3. Authenticate with Google using the local CLI provided by this project:
   ```bash
   npm run login
   ```

4. Once authenticated, use `npm run pull` to download the remote project or `npm run push` to upload your local changes.

## Available npm scripts

| Script | Description |
| ------ | ----------- |
| `npm run login` | Launches the local `@google/clasp` CLI login flow. |
| `npm run login -- --creds credentials.json` | Uses a downloaded OAuth credentials file if browser-based login is unavailable. |
| `npm run pull` | Downloads the latest code from the bound Apps Script project. |
| `npm run push` | Uploads local source files to Apps Script using the locally installed CLI. |
| `npm run open` | Opens the associated Apps Script project in your browser. |
| `npm run deploy` | Creates a deployment using the currently pushed version. |

All scripts use the locally installed `@google/clasp` binary, so a global installation is not required. If you prefer to keep using a global install, adjust the scripts accordingly.

## Troubleshooting credential errors

If `npm run push` reports `No credentials found.`, re-run the login command. In headless or containerized environments, download an OAuth client credentials JSON from Google Cloud Console and authenticate with:
```bash
npm run login -- --creds path/to/credentials.json
```
After successful login, retry `npm run push`.

## Troubleshooting permission errors

If `npm run push` reports `The caller does not have permission`, the authenticated account does not have edit access to the Apps Script project referenced by `.clasp.json`.

1. Confirm you are targeting the correct Script ID. Update `.clasp.json` if you meant to use a different project.
2. Ask the Apps Script project owner to share the project with your Google account (Apps Script editor → Share → Add editors).
3. After you gain access or update the Script ID, rerun `npm run push`.

## TypeScript projects

This repository is currently JavaScript-only. If you adopt TypeScript, follow the [google/clasp TypeScript template](https://github.com/google/clasp/tree/master/examples/typescript) by adding `npm run build` and `npm run watch` scripts that compile into a `dist/` directory. You can then modify `npm run push` to run the build step before calling `clasp push` to keep the deployment in sync with the compiled output.
