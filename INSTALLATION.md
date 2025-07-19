# Next.js LMS - Local Installation Guide

This guide will help you set up and run the Next.js Learning Management System (LMS) on your local machine with PostgreSQL.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18.13.0 or higher) - [Download here](https://nodejs.org/)
- **pnpm** (recommended package manager) - Install with: `npm install -g pnpm`
- **PostgreSQL** (already installed with default options) or **Docker**
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

You have two options for setting up the database:

#### Option A: Local PostgreSQL Installation

If you have PostgreSQL installed locally, ensure it's running and you can connect to it. The default connection details are:
- **Host**: localhost
- **Port**: 5432
- **Username**: postgres
- **Password**: postgres (or your chosen password)

Connect to PostgreSQL and create the database:

```bash
# Connect to PostgreSQL
psql -U postgres -h localhost

# Create the database
CREATE DATABASE "next-lms";

# Exit PostgreSQL
\q
```

#### Option B: Docker Compose (Recommended)

The easiest way to get started is to use the provided Docker Compose setup. This will create a PostgreSQL container and a separate Adminer container for database management.

```bash
# Start PostgreSQL and Adminer with Docker
docker-compose up -d
```

This will create two services:
- **PostgreSQL**: A PostgreSQL container with the database `next-lms`, username `postgres`, and password `postgres`, available on port `5432`.
- **Adminer**: A web-based database management tool available at `http://localhost:8080`.

## Environment Configuration

### 4. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration. See the `.env.example` file for a full list of required and optional variables.

**Important:** To access the teacher dashboard, you must set the `NEXT_PUBLIC_TEACHER_ID` to your Clerk user ID.

## External Services Setup

### 5. Configure External Services

This project relies on several external services for key features. You will need to create accounts and obtain API keys for the following:

- **Clerk:** For user authentication.
- **UploadThing:** For file uploads (course images, attachments, etc.).
- **Mux:** For video processing and streaming.
- **Stripe:** For payment processing.

Follow the instructions in the `.env.example` file to configure the API keys for each service.

## Database Migration and Seeding

### 6. Run Database Migrations

```bash
# Apply all pending migrations
pnpm dlx prisma migrate deploy
```

### 7. Seed the Database

```bash
# Run the seed script to populate categories and achievements
pnpm dlx tsx scripts/seed.ts
```

This will create the initial course categories and the available achievements for the gamification system.

## Running the Application

### 8. Start the Development Server

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### 9. Accessing the Application

- **Student View**: Navigate to `http://localhost:3000` and sign up or sign in.
- **Teacher View**: To access the teacher dashboard, ensure your Clerk user ID is set as the `NEXT_PUBLIC_TEACHER_ID` in your `.env` file. Then, navigate to `http://localhost:3000/teacher`.

## Features

This project is an enhanced Learning Management System (LMS) with a focus on gamification and modern assessment tools.

### Core LMS Features

- **Course Management:** Create, edit, and publish courses with chapters.
- **Content Delivery:** Video-based learning with Mux integration.
- **Progress Tracking:** Track user progress through chapters and courses.
- **Authentication:** Secure user authentication with Clerk.
- **Payment System:** Stripe integration for paid courses.
- **Free Courses:** Support for free course enrollment.

### Gamification

- **XP (Experience Points) System:** Users earn XP for completing learning activities, such as finishing chapters and quizzes.
- **Leveling System:** Users level up based on their total XP, with visual progress indicators.
- **Achievements:** Users can unlock a variety of achievements for reaching milestones, categorized into Learning, Consistency, and Excellence.
- **Streaks:** Daily learning streaks are tracked to encourage consistent study habits. A "streak freeze" feature is available.
- **Leaderboards:** Time-based leaderboards (weekly, monthly, all-time) to foster friendly competition.
- **Daily Goals:** Users have daily XP goals to encourage regular engagement.

### Enhanced Assessment System

- **Quiz Engine:** Teachers can create quizzes with various question types, including multiple-choice, true/false, and fill-in-the-blank.
- **Assignments:** Teachers can create assignments with deadlines and grading rubrics.
- **Certification:** Upon course completion, users can claim a verifiable certificate.

## Troubleshooting

If you encounter any issues during setup, please refer to the "Troubleshooting" section in the original `README.md` file, or consult the documentation for the respective external services.
