This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Features

This project is an enhanced Learning Management System (LMS) with a focus on gamification and modern assessment tools. The features are inspired by successful platforms like Duolingo, Khan Academy, and Coursera.

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

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
