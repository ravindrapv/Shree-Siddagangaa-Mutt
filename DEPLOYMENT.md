# Shree Siddaganga Mutt - Guest House Console Deployment Guide

This guide details clear, step-by-step instructions to deploy the Shree Siddaganga Mutt Stay Registry system on Vercel as a full-stack Next.js application.

---

## 1. Project Stack Summary

- **Framework**: Next.js (App Router with Server Actions)
- **Database**: PostgreSQL (Prisma ORM Client)
- **Demo Engine**: Local JSON file sandbox (`mock-db.json`)
- **Deployment Platform**: Vercel (Full Stack Serverless)

---

## 2. Environment Variables Configuration

Before deploying, prepare the following environment variables. In Vercel, you can set these in **Project Settings > Environment Variables**:

| Variable Name | Description / Values | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL Database Connection URI | `postgresql://admin:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Secret key used for signing session tokens | `siddagangamutt_secure_secret_token_99` |
| `NEXTAUTH_URL` | The base URL of your deployed application | `https://siddaganga-mutt-stay.vercel.app` |
| `NEXT_PUBLIC_DEMO_MODE` | Set `true` to run on mock JSON database, or `false` to connect to PostgreSQL database | `true` (Demo mode) / `false` (Prod DB) |

---

## 3. Database Setup (Optional - If `NEXT_PUBLIC_DEMO_MODE=false`)

If you are connecting a real PostgreSQL database (such as Neon, Supabase, or AWS RDS):

1. **Push the Schema**:
   Run the following command locally to create tables in your remote PostgreSQL database:
   ```bash
   npx prisma db push
   ```
2. **Seed the Database**:
   Populate default rooms and initial configs by running the seeder script:
   ```bash
   npm run seed
   ```

---

## 4. Deploying to Vercel

### Method A: Deploying via Vercel Dashboard (Recommended)

1. Push your code repository to **GitHub / GitLab / Bitbucket**.
2. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
3. Import the `Shree-Siddagangaa-Mutt` repository.
4. Under **Environment Variables**, add the keys detailed in Section 2 above.
5. Click **Deploy**. Vercel will automatically build the Next.js pages and provision serverless functions.

### Method B: Deploying via Vercel CLI

If you prefer command-line deployment:

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Authenticate and link the project:
   ```bash
   vercel login
   vercel link
   ```
3. Set your environment variables:
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXT_PUBLIC_DEMO_MODE
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   ```
4. Trigger production deploy:
   ```bash
   vercel --prod
   ```

---

## 5. Verification Credentials

Once deployed, access the `/login` page and authenticate using the credentials below:

### Kalyani Guest House Logins
- **Reception Desk (Viewer)**:
  - **Username**: `kalyani_reception`
  - **Password**: `KalyaniDesk@Rec44`
- **Office Admin (Full Access & Delete/Reset)**:
  - **Username**: `kalyani_admin`
  - **Password**: `SiddhaKalyani#Ad99`

### Yathri Nivasa Logins
- **Reception Desk (Viewer)**:
  - **Username**: `yathri_reception`
  - **Password**: `YathriDesk&Rec33`
- **Office Admin (Full Access & Delete/Reset)**:
  - **Username**: `yathri_admin`
  - **Password**: `MuttYathri$Ad88`
