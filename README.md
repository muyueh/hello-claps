# hello-claps

```mermaid
gitGraph LR
  branch work
  checkout work
  commit id: "Initial commit"
  commit id: "Set up clasp npm automation"
```

```mermaid
stateDiagram-v2
  [*] --> LoggedOut
  LoggedOut --> LoggedIn: npm run login
  LoggedIn --> Synced: npm run pull
  Synced --> ReadyToDeploy: npm run push
  ReadyToDeploy --> Deployed: npm run deploy
  Deployed --> Synced: iterate on scripts
```

```mermaid
sequenceDiagram
  participant Dev as Developer
  participant NPM as npm Scripts
  participant Clasp as @google/clasp CLI
  Dev->>NPM: npm run login
  NPM->>Clasp: clasp login
  Dev->>NPM: npm run push
  NPM->>Clasp: clasp push (local project)
  Clasp-->>Dev: Deployment status
  Dev->>NPM: npm run open
  NPM->>Clasp: clasp open (Apps Script editor)
```

```mermaid
flowchart LR
  subgraph Developer
    D[Local Workspace]
    S[npm scripts]
  end
  subgraph Google
    G[Apps Script Project]
  end
  D --> S --> G
```

```mermaid
flowchart LR
  subgraph Developer
    direction TB
    A1[Write/Update Apps Script files]
    A2[Run npm run push]
  end
  subgraph Frontend
    direction TB
    B1[Review deployment status]
    B2[Open editor via npm run open]
  end
  subgraph Backend
    direction TB
    C1[Receive clasp push]
    C2[Create deployments]
  end
  A1 --> A2 --> B1 --> B2 --> C1 --> C2
```

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Authenticate with Google using the local CLI provided by this project:
   ```bash
   npm run login
   ```

## Available npm scripts

| Script | Description |
| ------ | ----------- |
| `npm run login` | Launches the local `@google/clasp` CLI login flow. |
| `npm run pull` | Downloads the latest code from the bound Apps Script project. |
| `npm run push` | Uploads local source files to Apps Script using the locally installed CLI. |
| `npm run open` | Opens the associated Apps Script project in your browser. |
| `npm run deploy` | Creates a deployment using the currently pushed version. |

All scripts use the locally installed `@google/clasp` binary, so a global installation is not required. If you prefer to keep using a global install, adjust the scripts accordingly.

## TypeScript projects

This repository is currently JavaScript-only. If you adopt TypeScript, follow the [google/clasp TypeScript template](https://github.com/google/clasp/tree/master/examples/typescript) by adding `npm run build` and `npm run watch` scripts that compile into a `dist/` directory. You can then modify `npm run push` to run the build step before calling `clasp push` to keep the deployment in sync with the compiled output.
