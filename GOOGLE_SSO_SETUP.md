# Google SSO Setup Guide / מדריך הגדרת Google SSO

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Name: `Plugat Tzav` (or any name)
4. Click **"Create"**

## Step 2: Enable OAuth Consent Screen

1. In the left sidebar: **APIs & Services** → **OAuth consent screen**
2. Choose **"External"** user type → Click **"Create"**
3. Fill in:
   - **App name**: `פלוגת צב`
   - **User support email**: your email
   - **Developer contact**: your email
4. Click **"Save and Continue"**
5. **Scopes** — Click "Add or Remove Scopes":
   - Select: `email`, `profile`, `openid`
   - Click **"Save and Continue"**
6. **Test users** — Add the email addresses of people who will test the app
   - ⚠️ While the app is in "Testing" mode, only these users can log in
   - Once you publish to production, anyone can sign in
7. Click **"Save and Continue"**

## Step 3: Create OAuth Credentials

1. In the left sidebar: **APIs & Services** → **Credentials**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `Plugat Tzav Web`
5. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://plugat-tzav.onrender.com
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   https://plugat-tzav.onrender.com/api/auth/callback/google
   ```
7. Click **"Create"**
8. Copy the **Client ID** and **Client Secret**

## Step 4: Configure Environment Variables

### Local Development (.env.local)

```env
GOOGLE_CLIENT_ID=paste-your-client-id-here
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
AUTH_SECRET=generate-with-command-below
ADMIN_EMAIL=your-email@gmail.com
```

Generate AUTH_SECRET:
```bash
openssl rand -base64 32
```

Or on Windows (PowerShell):
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

### Render.com Environment Variables

In the Render dashboard → your service → **Environment**:

| Variable | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | Your Google Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret |
| `AUTH_SECRET` | Random 32-byte base64 string |
| `ADMIN_EMAIL` | Your email (first admin) |
| `NEXT_PUBLIC_SITE_URL` | `https://plugat-tzav.onrender.com` |
| `NEXT_PUBLIC_DONATION_URL` | Your donation page URL |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Contact email |
| `AUTH_URL` | `https://plugat-tzav.onrender.com` |

## Step 5: Publish to Production (When Ready)

1. Go to **OAuth consent screen**
2. Click **"Publish App"**
3. Confirm the dialog
4. Now anyone with a Google account can sign in

⚠️ **Important**: Until you publish, only test users you added in Step 2.6 can log in.

## How the Admin System Works

### First Login
- The **first user** to log in automatically becomes **admin**
- OR: if `ADMIN_EMAIL` is set, that email gets admin role on login

### User Roles
- **Admin** (`מנהל`): Full access to all pages + admin panel at `/admin`
- **Member** (`חבר/ת פלוגה`): Access based on page-level permissions

### Page Access Levels
Set per-page in the admin panel (`/admin/pages`):
- **Public** (`🌐 פתוח`): Anyone can access, no login needed
- **Members** (`🔒 חברים`): Any logged-in active member
- **Groups** (`🏷️ קבוצות`): Only members in specific groups

### Admin Panel (`/admin`)
- **Users** (`/admin/users`): Manage users, assign roles & groups
- **Groups** (`/admin/groups`): Create/edit groups (e.g., "Commanders", "Soldiers")
- **Pages** (`/admin/pages`): Set access level per page + allowed groups
