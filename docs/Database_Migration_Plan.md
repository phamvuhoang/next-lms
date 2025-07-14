# Database Migration Plan
## Enhanced LMS with Gamification Features

### 1. Migration Overview

This document outlines the step-by-step database migration plan to enhance the existing LMS with gamification, quiz system, and advanced features while maintaining data integrity and zero downtime.

### 2. Current Database State Analysis

#### 2.1 Existing Tables
```sql
- Course (id, createdById, title, description, imageUrl, price, isPublished, isFree, categoryId, createdAt, updatedAt)
- Category (id, name)
- Attachment (id, name, url, courseId, createdAt, updatedAt)
- Chapter (id, title, description, videoUrl, position, isPublished, isFree, courseId, createdAt, updatedAt)
- MuxData (id, assetId, playbackId, chapterId)
- UserProgress (id, userId, chapterId, isCompleted, createdAt, updatedAt)
- Purchase (id, userId, courseId, createdAt, updatedAt)
- StripeCustomer (id, userid, stripeCustomerId, createdAt, updatedAt)
```

### 3. Migration Phases

#### Phase 1: Core Gamification Tables (Week 1)

##### 3.1 Create UserXP Table
```sql
-- Migration: 001_create_user_xp.sql
CREATE TABLE "UserXP" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "currentLevelXP" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserXP_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserXP_userId_key" ON "UserXP"("userId");
```

##### 3.2 Create XPTransaction Table
```sql
-- Migration: 002_create_xp_transaction.sql
CREATE TABLE "XPTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XPTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "XPTransaction_userId_createdAt_idx" ON "XPTransaction"("userId", "createdAt");

ALTER TABLE "XPTransaction" ADD CONSTRAINT "XPTransaction_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "UserXP"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
```

##### 3.3 Create Achievement Tables
```sql
-- Migration: 003_create_achievements.sql
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "condition" JSONB NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" 
ON "UserAchievement"("userId", "achievementId");

ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" 
FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

##### 3.4 Create UserStreak Table
```sql
-- Migration: 004_create_user_streak.sql
CREATE TABLE "UserStreak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" TIMESTAMP(3),
    "freezesUsed" INTEGER NOT NULL DEFAULT 0,
    "freezesAvailable" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStreak_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserStreak_userId_key" ON "UserStreak"("userId");
```

#### Phase 2: Quiz System Tables (Week 2)

##### 3.5 Create Quiz Tables
```sql
-- Migration: 005_create_quiz_system.sql
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "chapterId" TEXT,
    "courseId" TEXT,
    "timeLimit" INTEGER,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "xpReward" INTEGER NOT NULL DEFAULT 25,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Quiz_chapterId_idx" ON "Quiz"("chapterId");
CREATE INDEX "Quiz_courseId_idx" ON "Quiz"("courseId");

ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_chapterId_fkey" 
FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_courseId_fkey" 
FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

##### 3.6 Create Question Table
```sql
-- Migration: 006_create_questions.sql
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" JSONB NOT NULL,
    "explanation" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Question_quizId_order_idx" ON "Question"("quizId", "order");

ALTER TABLE "Question" ADD CONSTRAINT "Question_quizId_fkey" 
FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

##### 3.7 Create QuizAttempt Table
```sql
-- Migration: 007_create_quiz_attempts.sql
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "totalPoints" INTEGER NOT NULL,
    "timeSpent" INTEGER,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "QuizAttempt_userId_quizId_idx" ON "QuizAttempt"("userId", "quizId");

ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" 
FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

#### Phase 3: Assignment System Tables (Week 3)

##### 3.8 Create Assignment Tables
```sql
-- Migration: 008_create_assignments.sql
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "chapterId" TEXT,
    "courseId" TEXT,
    "dueDate" TIMESTAMP(3),
    "maxPoints" INTEGER NOT NULL DEFAULT 100,
    "allowLateSubmission" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "xpReward" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Assignment_chapterId_idx" ON "Assignment"("chapterId");
CREATE INDEX "Assignment_courseId_idx" ON "Assignment"("courseId");

ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_chapterId_fkey" 
FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_courseId_fkey" 
FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

##### 3.9 Create AssignmentSubmission Table
```sql
-- Migration: 009_create_assignment_submissions.sql
CREATE TABLE "AssignmentSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "content" TEXT,
    "fileUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gradedAt" TIMESTAMP(3),

    CONSTRAINT "AssignmentSubmission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AssignmentSubmission_userId_assignmentId_key" 
ON "AssignmentSubmission"("userId", "assignmentId");

ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_assignmentId_fkey" 
FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

#### Phase 4: Certificate System (Week 4)

##### 3.10 Create Certificate Table
```sql
-- Migration: 010_create_certificates.sql
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "templateId" TEXT,
    "certificateUrl" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Certificate_userId_courseId_key" ON "Certificate"("userId", "courseId");
CREATE UNIQUE INDEX "Certificate_verificationCode_key" ON "Certificate"("verificationCode");

ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_courseId_fkey" 
FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

#### Phase 5: Enhance Existing Tables (Week 5)

##### 3.11 Add Gamification Fields to Course
```sql
-- Migration: 011_enhance_course_table.sql
ALTER TABLE "Course" ADD COLUMN "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Course" ADD COLUMN "difficulty" TEXT NOT NULL DEFAULT 'beginner';
ALTER TABLE "Course" ADD COLUMN "estimatedHours" INTEGER;
ALTER TABLE "Course" ADD COLUMN "xpReward" INTEGER NOT NULL DEFAULT 200;
```

##### 3.12 Add XP Reward to Chapter
```sql
-- Migration: 012_enhance_chapter_table.sql
ALTER TABLE "Chapter" ADD COLUMN "xpReward" INTEGER NOT NULL DEFAULT 50;
```

### 4. Data Migration Scripts

#### 4.1 Initialize User XP for Existing Users
```sql
-- Migration: 013_initialize_user_xp.sql
INSERT INTO "UserXP" ("id", "userId", "totalXP", "level", "currentLevelXP")
SELECT 
    gen_random_uuid()::text,
    DISTINCT "userId",
    0,
    1,
    0
FROM "UserProgress"
WHERE "userId" NOT IN (SELECT "userId" FROM "UserXP");
```

#### 4.2 Calculate Initial XP from Existing Progress
```sql
-- Migration: 014_calculate_initial_xp.sql
WITH user_progress_xp AS (
    SELECT 
        up."userId",
        COUNT(CASE WHEN up."isCompleted" = true THEN 1 END) * 50 as chapter_xp
    FROM "UserProgress" up
    JOIN "Chapter" c ON up."chapterId" = c."id"
    WHERE c."isPublished" = true
    GROUP BY up."userId"
),
course_completion_xp AS (
    SELECT 
        up."userId",
        COUNT(DISTINCT c."courseId") * 200 as course_xp
    FROM "UserProgress" up
    JOIN "Chapter" c ON up."chapterId" = c."id"
    WHERE up."isCompleted" = true AND c."isPublished" = true
    GROUP BY up."userId", c."courseId"
    HAVING COUNT(*) = (
        SELECT COUNT(*) 
        FROM "Chapter" c2 
        WHERE c2."courseId" = c."courseId" AND c2."isPublished" = true
    )
)
UPDATE "UserXP" 
SET 
    "totalXP" = COALESCE(upx.chapter_xp, 0) + COALESCE(ccx.course_xp, 0),
    "level" = GREATEST(1, FLOOR((COALESCE(upx.chapter_xp, 0) + COALESCE(ccx.course_xp, 0)) / 100) + 1),
    "currentLevelXP" = (COALESCE(upx.chapter_xp, 0) + COALESCE(ccx.course_xp, 0)) % 100
FROM user_progress_xp upx
FULL OUTER JOIN course_completion_xp ccx ON upx."userId" = ccx."userId"
WHERE "UserXP"."userId" = COALESCE(upx."userId", ccx."userId");
```

### 5. Rollback Strategy

#### 5.1 Rollback Scripts
```sql
-- Rollback migrations in reverse order
DROP TABLE IF EXISTS "Certificate";
DROP TABLE IF EXISTS "AssignmentSubmission";
DROP TABLE IF EXISTS "Assignment";
DROP TABLE IF EXISTS "QuizAttempt";
DROP TABLE IF EXISTS "Question";
DROP TABLE IF EXISTS "Quiz";
DROP TABLE IF EXISTS "UserStreak";
DROP TABLE IF EXISTS "UserAchievement";
DROP TABLE IF EXISTS "Achievement";
DROP TABLE IF EXISTS "XPTransaction";
DROP TABLE IF EXISTS "UserXP";

-- Remove added columns
ALTER TABLE "Course" DROP COLUMN IF EXISTS "prerequisites";
ALTER TABLE "Course" DROP COLUMN IF EXISTS "difficulty";
ALTER TABLE "Course" DROP COLUMN IF EXISTS "estimatedHours";
ALTER TABLE "Course" DROP COLUMN IF EXISTS "xpReward";
ALTER TABLE "Chapter" DROP COLUMN IF EXISTS "xpReward";
```

### 6. Testing Strategy

#### 6.1 Migration Testing
1. **Backup Production Data**: Create full database backup
2. **Test Environment**: Run migrations on staging with production data copy
3. **Validation**: Verify data integrity and foreign key constraints
4. **Performance**: Test query performance with new indexes
5. **Rollback Test**: Verify rollback procedures work correctly

#### 6.2 Post-Migration Validation
```sql
-- Validate data integrity
SELECT COUNT(*) FROM "UserXP" WHERE "userId" NOT IN (SELECT DISTINCT "userId" FROM "UserProgress");
SELECT COUNT(*) FROM "XPTransaction" WHERE "userId" NOT IN (SELECT "userId" FROM "UserXP");
-- Additional validation queries...
```

### 7. Deployment Checklist

- [ ] Database backup completed
- [ ] Migration scripts tested on staging
- [ ] Application code updated to handle new schema
- [ ] Feature flags configured
- [ ] Monitoring alerts configured
- [ ] Rollback procedures documented
- [ ] Team notified of deployment window
- [ ] Post-deployment validation scripts ready

This migration plan ensures a smooth transition to the enhanced LMS system while maintaining data integrity and minimizing downtime.
