# Next.js LMS - Local Installation Guide

This guide will help you set up and run the Next.js Learning Management System (LMS) on your local machine with PostgreSQL.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18.13.0 or higher) - [Download here](https://nodejs.org/)
- **pnpm** (recommended package manager) - Install with: `npm install -g pnpm`
- **PostgreSQL** (already installed with default options)
- **Git** - [Download here](https://git-scm.com/)

## Project Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd next-lms
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all required dependencies and automatically run `prisma generate` via the postinstall script.

## Database Setup

### 3. Configure PostgreSQL

Since PostgreSQL is already installed with default options, you should have:
- **Host**: localhost
- **Port**: 5432
- **Username**: postgres
- **Password**: postgres (or your chosen password)

### 4. Create Database

Connect to PostgreSQL and create the database:

```bash
# Connect to PostgreSQL
psql -U postgres -h localhost

# Create the database
CREATE DATABASE "next-lms";

# Exit PostgreSQL
\q
```

Alternatively, you can use the provided Docker Compose setup:

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres
```

This will create a PostgreSQL container with:
- Database: `next-lms`
- Username: `postgres`
- Password: `postgres`
- Port: `5432`

## Environment Configuration

### 5. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/next-lms"

# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Teacher ID (Set this to your Clerk user ID to access teacher features)
NEXT_PUBLIC_TEACHER_ID=your_clerk_user_id

# UploadThing Configuration (Required for file uploads)
UPLOADTHING_TOKEN=your_uploadthing_token_here

# Mux Configuration (Required for video processing)
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret

# Stripe Configuration (Required for payments)
STRIPE_API_KEY=your_stripe_api_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## External Services Setup

### 6. Clerk Authentication Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Copy the publishable key and secret key
4. Configure sign-in/sign-up URLs in Clerk dashboard:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/`
   - After sign-up URL: `/`

### 7. UploadThing Setup

1. Go to [UploadThing Dashboard](https://uploadthing.com/)
2. Create a new project
3. Copy the token from your project settings
4. The app supports uploading:
   - Course images (max 4MB)
   - Course attachments (text, image, video, audio, PDF)
   - Chapter videos (max 512GB)

### 8. Mux Setup (Video Processing)

1. Go to [Mux Dashboard](https://dashboard.mux.com/)
2. Create a new project
3. Generate API access tokens
4. Copy the Token ID and Token Secret

### 9. Stripe Setup (Payments)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys from the Developers section
3. Set up webhooks:
   - Endpoint URL: `http://localhost:3000/api/webhook`
   - Events to listen for: `checkout.session.completed`
   - Copy the webhook secret

## Database Migration and Seeding

### 10. Run Database Migrations

```bash
# Apply all pending migrations
pnpm dlx prisma migrate deploy

# Or reset the database and apply migrations
pnpm dlx prisma migrate reset
```

### 11. Seed the Database

```bash
# Run the seed script to populate categories
pnpm dlx tsx scripts/seed.ts
```

This will create the following course categories:
- Computer Science
- Music
- Fitness
- Photography
- Accounting
- Engineering
- Filming

## Running the Application

### 12. Start the Development Server

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 13. Access the Application

1. **Student View**: Navigate to `http://localhost:3000`
2. **Teacher View**: 
   - Sign up/Sign in with Clerk
   - Set your Clerk user ID as `NEXT_PUBLIC_TEACHER_ID` in `.env`
   - Access teacher features at `http://localhost:3000/teacher`

## Project Structure

```
next-lms/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (course)/          # Course-related pages
│   ├── (dashboard)/       # Dashboard pages
│   └── api/               # API routes
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
├── prisma/               # Database schema and migrations
├── scripts/              # Database seeding scripts
└── public/               # Static assets
```

## Available Scripts

```bash
# Development
pnpm dev                   # Start development server

# Production
pnpm build                 # Build for production
pnpm start                 # Start production server

# Database
pnpm dlx prisma studio     # Open Prisma Studio (database GUI)
pnpm dlx prisma migrate dev # Create and apply new migration
pnpm dlx prisma generate   # Generate Prisma client

# Code Quality
pnpm lint                  # Run ESLint
```

## Features

- **Authentication**: Secure user authentication with Clerk
- **Course Management**: Create, edit, and publish courses
- **Chapter Management**: Organize course content into chapters
- **Video Upload**: Upload and process videos with Mux
- **File Attachments**: Upload course materials
- **Payment Processing**: Stripe integration for course purchases
- **Progress Tracking**: Track student progress through courses
- **Analytics**: Course analytics and reporting
- **Responsive Design**: Mobile-friendly interface

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env file
   - Verify database exists

2. **Prisma Client Error**
   - Run `pnpm dlx prisma generate`
   - Check if migrations are applied

3. **Authentication Issues**
   - Verify Clerk keys in .env
   - Check Clerk dashboard configuration

4. **File Upload Issues**
   - Verify UploadThing token
   - Check file size limits

5. **Video Processing Issues**
   - Verify Mux credentials
   - Check video file format

### Getting Help

- Check the [Next.js Documentation](https://nextjs.org/docs)
- Review [Prisma Documentation](https://www.prisma.io/docs)
- Visit [Clerk Documentation](https://clerk.com/docs)

## Next Steps

After successful installation:

1. Create your first course as a teacher
2. Add chapters and content
3. Test the payment flow with Stripe test mode
4. Customize the application to your needs

---

**Note**: This is a development setup. For production deployment, additional configuration for security, performance, and scalability will be required.
