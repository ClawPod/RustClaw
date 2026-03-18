# Matrix Channel Setup & Configuration Guide

ZeroClaw can use the Matrix protocol to provide a self-hosted, end-to-end encrypted (E2EE) chat interface for your AI agent.

---

## 1. Homeserver Setup (Synapse)

The most common Matrix homeserver implementation is **Synapse**.

### Installation (Ubuntu/Debian)
If you haven't installed Synapse, use the official Matrix.org repository:
```bash
sudo apt update && sudo apt install -y lsb-release wget apt-transport-https
sudo wget -O /usr/share/keyrings/matrix-org-archive-keyring.gpg https://packages.matrix.org/debian/matrix-org-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/matrix-org-archive-keyring.gpg] https://packages.matrix.org/debian/ $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/matrix-org.list
sudo apt update && sudo apt install -y matrix-synapse-py3
```

### Critical Configuration (`homeserver.yaml`)
Edit `/etc/matrix-synapse/homeserver.yaml`:
1.  **Server Name:** Set this once. **You cannot change this later without deleting your database.**
    ```yaml
    server_name: "yourdomain.com"
    public_baseurl: "https://yourdomain.com/"
    ```
2.  **Shared Secret:** Required for command-line registration.
    ```yaml
    registration_shared_secret: "your_long_random_secret_here"
    ```
3.  **Listeners:** Ensure it listens on port 8008 (standard).
    ```yaml
    listeners:
      - port: 8008
        tls: false
        type: http
        x_forwarded: true
        resources:
          - names: [client, federation]
            compress: false
    ```

---

## 2. Nginx Reverse Proxy

Matrix requires a reverse proxy to handle SSL and route traffic to Synapse.

Add this to your Nginx configuration (e.g., `/etc/nginx/conf.d/matrix.conf`):

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    # SSL Config (Certbot recommended)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location /_matrix {
        proxy_pass http://127.0.0.1:8008;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        client_max_body_size 50M; # Required for file uploads/attachments
    }
}
```

---

## 3. Bot Account Management

### Register the Bot User
Run this on the server to create an account for ZeroClaw:
```bash
/opt/venvs/matrix-synapse/bin/register_new_matrix_user \
  -c /etc/matrix-synapse/homeserver.yaml \
  -u bot_user \
  -p bot_password \
  --no-admin \
  http://localhost:8008
```

### Obtain Access Token & Device ID
You need these for ZeroClaw's configuration. Use `curl` to log in as the bot:
```bash
curl -XPOST -d '{"type":"m.login.password", "user":"bot_user", "password":"bot_password"}' \
  "https://yourdomain.com/_matrix/client/v3/login"
```
**Keep the `access_token` and `device_id` from the JSON response.**

---

## 4. ZeroClaw Configuration

Update your `~/.zeroclaw/config.toml` with the Matrix details.

```toml
[channels_config.matrix]
# The public URL of your homeserver
homeserver = "https://yourdomain.com"

# The credentials obtained in Step 3
access_token = "syt_Ym90X3VzZXI..."
user_id = "@bot_user:yourdomain.com"
device_id = "ABCDEFGHIJ"

# The internal Room ID (found in Element > Room Settings > Advanced)
room_id = "!room_id_string:yourdomain.com"

# Security: List of users allowed to talk to the bot
allowed_users = ["@your_admin:yourdomain.com"]
```

---

## 5. Joining the Room

Matrix has strict permissions. Even with the correct `room_id`, the bot **cannot join a room unless invited**.

1.  Log in to a Matrix client (like Element) as your personal account.
2.  Create a room (or go to an existing one).
3.  **Invite the bot:** Search for `@bot_user:yourdomain.com` and click Invite.
4.  Start the ZeroClaw daemon:
    ```bash
    zeroclaw daemon
    ```
5.  ZeroClaw will detect the invitation, join automatically, and start listening for messages.

---

## 6. Troubleshooting FAQ

#### Q: Bot logs show `M_FORBIDDEN` / "User not in room"
**A:** Ensure you have invited the bot to the room. If it still fails, manually join the bot using the API:
```bash
curl -X POST -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     "https://yourdomain.com/_matrix/client/v3/rooms/ROOM_ID/join"
```

#### Q: How do I change the `server_name`?
**A:** You cannot change the name in an existing database. You must:
1. Stop Synapse.
2. Delete `/var/lib/matrix-synapse/homeserver.db`.
3. Delete `/etc/matrix-synapse/homeserver.signing.key`.
4. Update `server_name` in `homeserver.yaml`.
5. Restart and re-register users.

#### Q: Bot isn't responding in encrypted rooms
**A:** Ensure `device_id` is set correctly in `config.toml`. The first time the bot joins an encrypted room, you may need to verify its session from another device to establish trust.
