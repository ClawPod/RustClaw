# Playwright Automation Support Plan

This document outlines the strategy for integrating advanced browser automation into ZeroClaw via a new `playwright` tool, supporting local Playwright sidecars.

## 1. Objectives

*   **Low Latency**: Move beyond CLI-based `agent-browser` to persistent sidecar sessions.
*   **Enhanced Capability**: Enable complex actions like `evaluate_script` and `wait_until_network_idle`.
*   **Vision Integration**: Seamlessly feed browser visual state into multimodal models.

## 2. Architecture & Config Updates

### Configuration (`src/config/schema.rs`)
Add a new `[playwright]` section for specific settings:

```toml
[playwright]
enabled = true
endpoint = "http://127.0.0.1:3000"
api_key = "..." # optional
use_proxy = true
allowed_domains = ["*"]
```

### Tool Definition (`src/tools/playwright.rs`)
A new tool will be created to handle Playwright-specific logic:
*   **Actions**: Implement `PlaywrightAction` enum:
    *   `Open { url: String }`.
    *   `Click { selector: String }`.
    *   `Fill { selector: String, value: String }`.
    *   `Type { selector: String, text: String }`.
    *   `GoBack`, `GoForward`, `Refresh`.
    *   `EvaluateScript { script: String }`.
    *   `SetViewport { width: u32, height: u32 }`.
    *   `WaitUntil { state: "load" | "domcontentloaded" | "networkidle" }`.
    *   `Screenshot { path: Option<String>, full_page: bool }`.

## 3. Implementation Phases

### Phase A: Schema & Plumbing
1.  Update `src/config/schema.rs` with `PlaywrightConfig`.
2.  Create `PlaywrightTool` in `src/tools/playwright.rs` to handle initialization of these configs.
3.  Implement validation logic for endpoints and API keys.

### Phase B: Playwright Sidecar (Initial Focus)
1.  Develop/Standardize a lightweight Node.js sidecar that exposes Playwright via a REST/WebSocket API.
2.  Implement the Rust client in `src/tools/playwright.rs` to communicate with this sidecar.
3.  Implement persistent session logic (keeping the browser open between tool calls).

### Phase C: Advanced Scripting & Vision
1.  Implement `evaluate_script` to allow agents to extract custom data or trigger complex UI logic.
2.  Optimize screenshot performance and ensure compatibility with `src/multimodal.rs`.
3.  Support "Accessibility Tree" snapshots for text-heavy LLM reasoning.

## 4. Security & Safety

*   **Domain Allowlist**: Enforce `allowed_domains` at the tool level.
*   **Script Sanitization**: Restrict `evaluate_script` based on security policy (e.g., block access to sensitive `localStorage`).
*   **Timeout Enforcement**: Strict timeouts for all remote browser operations to prevent resource exhaustion.

## 5. Verification Strategy

*   **Unit Tests**: Validate config serialization/deserialization.
*   **Mocked Integration**: Use `wiremock` to simulate Playwright sidecar responses.
*   **Live Component Tests**: Provide a test suite that runs against a local Playwright sidecar if available.
