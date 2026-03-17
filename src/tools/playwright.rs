use super::traits::{Tool, ToolResult};
use crate::security::SecurityPolicy;
use anyhow::Context;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::sync::Arc;
use tracing::debug;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "action")]
pub enum PlaywrightAction {
    Open {
        url: String,
    },
    Click {
        selector: String,
    },
    Fill {
        selector: String,
        value: String,
    },
    Type {
        selector: String,
        text: String,
    },
    GoBack,
    GoForward,
    Refresh,
    EvaluateScript {
        script: String,
    },
    SetViewport {
        width: u32,
        height: u32,
    },
    WaitUntil {
        state: String, // "load" | "domcontentloaded" | "networkidle"
    },
    Screenshot {
        path: Option<String>,
        #[serde(default)]
        full_page: bool,
    },
}

pub struct PlaywrightTool {
    security: Arc<SecurityPolicy>,
    endpoint: String,
    #[allow(dead_code)]
    api_key: Option<String>,
    #[allow(dead_code)]
    use_proxy: bool,
    allowed_domains: Vec<String>,
    client: reqwest::Client,
}

impl PlaywrightTool {
    pub fn new(
        security: Arc<SecurityPolicy>,
        endpoint: String,
        api_key: Option<String>,
        use_proxy: bool,
        allowed_domains: Vec<String>,
    ) -> Self {
        Self {
            security,
            endpoint,
            api_key,
            use_proxy,
            allowed_domains,
            client: reqwest::Client::new(),
        }
    }

    async fn call_sidecar(&self, action: &PlaywrightAction) -> anyhow::Result<ToolResult> {
        let url = format!("{}/action", self.endpoint.trim_end_matches('/'));
        let mut request = self.client.post(&url).json(action);

        if let Some(ref api_key) = self.api_key {
            request = request.header("Authorization", format!("Bearer {}", api_key));
        }

        debug!("Calling Playwright sidecar action: {:?}", action);

        let response = request
            .send()
            .await
            .context("Failed to send request to Playwright sidecar")?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());
            return Ok(ToolResult {
                success: false,
                output: String::new(),
                error: Some(format!(
                    "Sidecar returned error ({}): {}",
                    status,
                    error_text
                )),
            });
        }

        let result: ToolResult = response
            .json()
            .await
            .context("Failed to parse sidecar response")?;
        Ok(result)
    }

    fn validate_url(&self, url: &str) -> anyhow::Result<()> {
        let url = url.trim();

        if url.is_empty() {
            anyhow::bail!("URL cannot be empty");
        }

        if url.starts_with("file://") {
            anyhow::bail!("file:// URLs are not allowed in browser automation");
        }

        if !url.starts_with("https://") && !url.starts_with("http://") {
            anyhow::bail!("Only http:// and https:// URLs are allowed");
        }

        if self.allowed_domains.is_empty() {
            anyhow::bail!(
                "Playwright tool enabled but no allowed_domains configured. \
                Add [playwright].allowed_domains in config.toml"
            );
        }

        // "*" means allow all public domains
        if self.allowed_domains.contains(&"*".to_string()) {
            let host = extract_host(url)?;
            if is_private_host(&host) {
                anyhow::bail!("Blocked local/private host: {host}");
            }
            return Ok(());
        }

        let host = extract_host(url)?;

        if is_private_host(&host) {
            anyhow::bail!("Blocked local/private host: {host}");
        }

        if !host_matches_allowlist(&host, &self.allowed_domains) {
            anyhow::bail!("Host '{host}' not in playwright.allowed_domains");
        }

        Ok(())
    }
}

#[async_trait]
impl Tool for PlaywrightTool {
    fn name(&self) -> &str {
        "playwright"
    }

    fn description(&self) -> &str {
        "High-performance browser automation using Playwright sidecar. Supports complex interactions, scripting, and screenshots."
    }

    fn description_zh(&self) -> &str {
        "高性能浏览器自动化，基于 Playwright。支持复杂的交互、脚本和截图。"
    }

    fn parameters_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "enum": ["open", "click", "fill", "type", "go_back", "go_forward", "refresh", "evaluate_script", "set_viewport", "wait_until", "screenshot"],
                    "description": "The action to perform."
                },
                "url": { "type": "string", "description": "URL to open." },
                "selector": { "type": "string", "description": "CSS selector for click/fill/type." },
                "value": { "type": "string", "description": "Value for fill." },
                "text": { "type": "string", "description": "Text for type." },
                "script": { "type": "string", "description": "JavaScript to evaluate." },
                "width": { "type": "integer", "description": "Viewport width." },
                "height": { "type": "integer", "description": "Viewport height." },
                "state": {
                    "type": "string",
                    "enum": ["load", "domcontentloaded", "networkidle"],
                    "description": "Wait state."
                },
                "path": { "type": "string", "description": "Path to save screenshot (optional)." },
                "full_page": { "type": "boolean", "description": "Capture full page screenshot." }
            },
            "required": ["action"]
        })
    }

    async fn execute(&self, args: Value) -> anyhow::Result<ToolResult> {
        let action: PlaywrightAction = serde_json::from_value(args)
            .context("Failed to parse PlaywrightAction")?;

        // Domain validation for 'open' action
        if let PlaywrightAction::Open { url } = &action {
            self.validate_url(url)?;
        }

        // For other actions, we assume the session is already open and validated
        // but we might want to validate the current URL if possible in the future.

        self.call_sidecar(&action).await
    }
}

// Helper functions copied from browser.rs

fn extract_host(url_str: &str) -> anyhow::Result<String> {
    let url = url_str.trim();
    let without_scheme = url
        .strip_prefix("https://")
        .or_else(|| url.strip_prefix("http://"))
        .or_else(|| url.strip_prefix("file://"))
        .unwrap_or(url);

    let authority = without_scheme.split('/').next().unwrap_or(without_scheme);

    let host = if authority.starts_with('[') {
        authority
            .find(']')
            .map_or(authority, |i| &authority[..=i])
    } else {
        authority.split(':').next().unwrap_or(authority)
    };

    if host.is_empty() {
        anyhow::bail!("Invalid URL: no host");
    }

    Ok(host.to_lowercase())
}

fn is_private_host(host: &str) -> bool {
    let bare = host
        .strip_prefix('[')
        .and_then(|h| h.strip_suffix(']'))
        .unwrap_or(host);

    if bare == "localhost" || bare.ends_with(".localhost") {
        return true;
    }

    if bare
        .rsplit('.')
        .next()
        .is_some_and(|label| label == "local")
    {
        return true;
    }

    if let Ok(ip) = bare.parse::<std::net::IpAddr>() {
        return match ip {
            std::net::IpAddr::V4(v4) => is_non_global_v4(v4),
            std::net::IpAddr::V6(v6) => is_non_global_v6(v6),
        };
    }

    false
}

fn is_non_global_v4(addr: std::net::Ipv4Addr) -> bool {
    addr.is_loopback()
        || addr.is_private()
        || addr.is_link_local()
        || addr.is_broadcast()
        || addr.is_documentation()
        || addr.is_unspecified()
}

fn is_non_global_v6(addr: std::net::Ipv6Addr) -> bool {
    addr.is_loopback() || addr.is_unspecified() || (addr.segments()[0] & 0xff00) == 0xfe00
}

fn host_matches_allowlist(host: &str, allowed: &[String]) -> bool {
    allowed.iter().any(|pattern| {
        if pattern == "*" {
            return true;
        }
        let pattern = pattern.to_lowercase();
        if pattern.starts_with("*.") {
            // Wildcard subdomain match
            let suffix = &pattern[1..]; // ".example.com"
            host.ends_with(suffix) || host == &pattern[2..]
        } else {
            // Exact match or subdomain
            host == pattern || host.ends_with(&format!(".{pattern}"))
        }
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn mock_security() -> Arc<SecurityPolicy> {
        Arc::new(SecurityPolicy {
            autonomy: crate::security::AutonomyLevel::Supervised,
            workspace_dir: PathBuf::from("/tmp"),
            workspace_only: false,
            allowed_commands: vec![],
            forbidden_paths: vec![],
            allowed_roots: vec![],
            max_actions_per_hour: 100,
            max_cost_per_day_cents: 1000,
            require_approval_for_medium_risk: true,
            block_high_risk_commands: true,
            shell_env_passthrough: vec![],
            tracker: crate::security::policy::ActionTracker::new(),
        })
    }

    #[test]
    fn test_validate_url_allowed_domains() {
        let tool = PlaywrightTool::new(
            mock_security(),
            "http://localhost:3000".to_string(),
            None,
            true,
            vec!["example.com".to_string(), "*.google.com".to_string()],
        );

        assert!(tool.validate_url("https://example.com").is_ok());
        assert!(tool.validate_url("https://www.google.com").is_ok());
        assert!(tool.validate_url("https://google.com").is_ok());
        assert!(tool.validate_url("https://evil.com").is_err());
    }

    #[test]
    fn test_validate_url_wildcard() {
        let tool = PlaywrightTool::new(
            mock_security(),
            "http://localhost:3000".to_string(),
            None,
            true,
            vec!["*".to_string()],
        );

        assert!(tool.validate_url("https://anything.com").is_ok());
        assert!(tool.validate_url("https://localhost").is_err());
        assert!(tool.validate_url("https://127.0.0.1").is_err());
    }

    #[test]
    fn test_extract_host() {
        assert_eq!(extract_host("https://example.com/path").unwrap(), "example.com");
        assert_eq!(extract_host("http://localhost:8080").unwrap(), "localhost");
        assert_eq!(extract_host("https://[::1]:3000/").unwrap(), "[::1]");
    }
}

