# Wedding RSVP Website Deployment Guide

## Production Environment Setup

### Prerequisites

1. **Google Cloud Project Setup**
   - Create a new Google Cloud Project
   - Enable Google Sheets API
   - Create a Service Account with Sheets access
   - Download the service account JSON key file

2. **Google Sheets Setup**
   - Create a new Google Sheets document
   - Set up the required column structure:
     | Column A | Column B | Column C | Column D | Column E | Column F | Column G |
     |----------|----------|----------|----------|----------|----------|----------|
     | Invitation_Code | Guest_Names | RSVP_Status | Dietary_Restrictions | Personal_Message | Submission_Date | Email |
   - Share the spreadsheet with your service account email (found in the JSON key file)
   - Give the service account "Editor" permissions

### Vercel Deployment

1. **Connect Repository**
   - Import your project to Vercel
   - Connect your GitHub/GitLab repository

2. **Environment Variables**
   Set the following environment variables in Vercel dashboard:

   ```
   GOOGLE_SHEETS_PRIVATE_KEY=<your_service_account_private_key>
   GOOGLE_SHEETS_CLIENT_EMAIL=<your_service_account_email>
   GOOGLE_SHEETS_SPREADSHEET_ID=<your_spreadsheet_id>
   NEXT_PUBLIC_WEDDING_DATE=<your_wedding_date>
   NEXT_PUBLIC_VENUE_NAME=<your_venue_name>
   NEXT_PUBLIC_VENUE_ADDRESS=<your_venue_address>
   ```

   **Important Notes:**
   - The `GOOGLE_SHEETS_PRIVATE_KEY` should include the full private key with `\n` characters
   - The `GOOGLE_SHEETS_SPREADSHEET_ID` is found in the Google Sheets URL
   - Public environment variables (prefixed with `NEXT_PUBLIC_`) will be visible to clients

3. **Deploy**
   - Vercel will automatically deploy on every push to your main branch
   - Monitor the deployment logs for any issues

### Alternative Deployment Options

#### Docker Deployment
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Manual Server Deployment
```bash
# Build the application
npm run build

# Start the production server
npm start
```

### Environment Variable Security

- Never commit `.env` files to version control
- Use Vercel's environment variable management
- Rotate service account keys regularly
- Monitor API usage in Google Cloud Console

### Monitoring and Maintenance

- Check Vercel deployment logs regularly
- Monitor Google Sheets API quotas
- Set up alerts for deployment failures
- Keep dependencies updated for security patches