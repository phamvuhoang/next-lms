# Implementation Design Document
## Enhanced LMS with Gamification and Assessment System

### 1. Architecture Overview

#### 1.1 System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js 14) │◄──►│   (Next.js API) │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │   Services      │    │   Prisma ORM    │
│   (shadcn/ui)   │    │   (Business     │    │   (Schema)      │
│                 │    │    Logic)       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### 1.2 Technology Stack Enhancements
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Real-time**: WebSockets for live updates (achievements, XP)
- **Caching**: Redis for leaderboards and analytics
- **File Storage**: UploadThing for assignments and certificates
- **Notifications**: React Hot Toast + Email notifications
- **Charts**: Recharts for analytics visualization

### 2. Database Schema Design

#### 2.1 New Tables

```sql
-- User Experience Points
model UserXP {
  id        String   @id @default(cuid())
  userId    String
  totalXP   Int      @default(0)
  level     Int      @default(1)
  currentLevelXP Int  @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  xpTransactions XPTransaction[]
  
  @@unique([userId])
}

-- XP Transaction History
model XPTransaction {
  id          String   @id @default(cuid())
  userId      String
  amount      Int
  reason      String
  sourceType  String   // 'chapter', 'quiz', 'assignment', 'streak'
  sourceId    String?
  createdAt   DateTime @default(now())
  
  userXP      UserXP   @relation(fields: [userId], references: [userId])
  
  @@index([userId, createdAt])
}

-- Achievements
model Achievement {
  id          String   @id @default(cuid())
  name        String
  description String
  icon        String
  category    String   // 'learning', 'consistency', 'excellence', 'social'
  condition   Json     // Flexible condition definition
  xpReward    Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  userAchievements UserAchievement[]
}

-- User Achievements
model UserAchievement {
  id            String      @id @default(cuid())
  userId        String
  achievementId String
  unlockedAt    DateTime    @default(now())
  
  achievement   Achievement @relation(fields: [achievementId], references: [id])
  
  @@unique([userId, achievementId])
}

-- Learning Streaks
model UserStreak {
  id              String   @id @default(cuid())
  userId          String
  currentStreak   Int      @default(0)
  longestStreak   Int      @default(0)
  lastActivityDate DateTime?
  freezesUsed     Int      @default(0)
  freezesAvailable Int     @default(3)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([userId])
}

-- Quizzes
model Quiz {
  id          String   @id @default(cuid())
  title       String
  description String?
  chapterId   String?
  courseId    String?
  timeLimit   Int?     // in minutes
  maxAttempts Int      @default(3)
  passingScore Int     @default(70)
  isPublished Boolean  @default(false)
  xpReward    Int      @default(25)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  chapter     Chapter? @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  course      Course?  @relation(fields: [courseId], references: [id], onDelete: Cascade)
  questions   Question[]
  attempts    QuizAttempt[]
  
  @@index([chapterId])
  @@index([courseId])
}

-- Quiz Questions
model Question {
  id          String   @id @default(cuid())
  quizId      String
  type        String   // 'multiple_choice', 'true_false', 'fill_blank', 'drag_drop'
  question    String
  options     Json?    // For multiple choice options
  correctAnswer Json   // Flexible answer format
  explanation String?
  points      Int      @default(1)
  order       Int
  createdAt   DateTime @default(now())
  
  quiz        Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  
  @@index([quizId, order])
}

-- Quiz Attempts
model QuizAttempt {
  id          String   @id @default(cuid())
  userId      String
  quizId      String
  answers     Json     // User's answers
  score       Float
  totalPoints Int
  timeSpent   Int?     // in seconds
  completedAt DateTime @default(now())
  
  quiz        Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  
  @@index([userId, quizId])
}

-- Assignments
model Assignment {
  id          String   @id @default(cuid())
  title       String
  description String
  chapterId   String?
  courseId    String?
  dueDate     DateTime?
  maxPoints   Int      @default(100)
  allowLateSubmission Boolean @default(true)
  isPublished Boolean  @default(false)
  xpReward    Int      @default(50)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  chapter     Chapter? @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  course      Course?  @relation(fields: [courseId], references: [id], onDelete: Cascade)
  submissions AssignmentSubmission[]
  
  @@index([chapterId])
  @@index([courseId])
}

-- Assignment Submissions
model AssignmentSubmission {
  id           String     @id @default(cuid())
  userId       String
  assignmentId String
  content      String?
  fileUrls     String[]   @default([])
  score        Float?
  feedback     String?
  submittedAt  DateTime   @default(now())
  gradedAt     DateTime?
  
  assignment   Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  
  @@unique([userId, assignmentId])
}

-- Certificates
model Certificate {
  id          String   @id @default(cuid())
  userId      String
  courseId    String
  templateId  String?
  certificateUrl String
  verificationCode String @unique
  issuedAt    DateTime @default(now())
  
  course      Course   @relation(fields: [courseId], references: [id])
  
  @@unique([userId, courseId])
}
```

#### 2.2 Enhanced Existing Tables

```sql
-- Enhanced Course model
model Course {
  // ... existing fields ...
  prerequisites String[] @default([]) // Course IDs
  difficulty    String   @default("beginner") // beginner, intermediate, advanced
  estimatedHours Int?
  xpReward      Int      @default(200)
  
  // New relations
  quizzes       Quiz[]
  assignments   Assignment[]
  certificates  Certificate[]
}

-- Enhanced Chapter model  
model Chapter {
  // ... existing fields ...
  xpReward      Int      @default(50)
  
  // New relations
  quizzes       Quiz[]
  assignments   Assignment[]
}
```

### 3. API Design

#### 3.1 XP System APIs

```typescript
// /api/xp/[userId]/route.ts
GET    /api/xp/[userId]           // Get user XP data
POST   /api/xp/award              // Award XP to user
GET    /api/xp/leaderboard        // Get XP leaderboard

// /api/achievements/route.ts
GET    /api/achievements          // Get all achievements
POST   /api/achievements          // Create achievement (admin)
GET    /api/achievements/[userId] // Get user achievements
POST   /api/achievements/check    // Check and award achievements
```

#### 3.2 Quiz System APIs

```typescript
// /api/quizzes/route.ts
GET    /api/quizzes               // Get quizzes (with filters)
POST   /api/quizzes               // Create quiz

// /api/quizzes/[quizId]/route.ts
GET    /api/quizzes/[quizId]      // Get quiz details
PATCH  /api/quizzes/[quizId]      // Update quiz
DELETE /api/quizzes/[quizId]      // Delete quiz

// /api/quizzes/[quizId]/attempt/route.ts
POST   /api/quizzes/[quizId]/attempt    // Submit quiz attempt
GET    /api/quizzes/[quizId]/attempts   // Get user attempts
```

#### 3.3 Assignment System APIs

```typescript
// /api/assignments/route.ts
GET    /api/assignments           // Get assignments
POST   /api/assignments           // Create assignment

// /api/assignments/[assignmentId]/route.ts
GET    /api/assignments/[assignmentId]        // Get assignment
PATCH  /api/assignments/[assignmentId]        // Update assignment
DELETE /api/assignments/[assignmentId]        // Delete assignment

// /api/assignments/[assignmentId]/submit/route.ts
POST   /api/assignments/[assignmentId]/submit // Submit assignment
GET    /api/assignments/[assignmentId]/submissions // Get submissions
```

### 4. Component Architecture

#### 4.1 Gamification Components

```typescript
// components/gamification/
├── xp-display.tsx              // XP progress bar and level
├── achievement-badge.tsx       // Individual achievement display
├── achievement-modal.tsx       // Achievement unlock celebration
├── streak-counter.tsx          // Daily streak display
├── leaderboard.tsx            // XP leaderboard component
├── level-progress.tsx         // Level progression indicator
└── xp-transaction-history.tsx // XP earning history
```

#### 4.2 Assessment Components

```typescript
// components/assessments/
├── quiz-builder/
│   ├── quiz-form.tsx          // Quiz creation form
│   ├── question-builder.tsx   // Question creation component
│   └── question-types/        // Different question type components
├── quiz-player/
│   ├── quiz-interface.tsx     // Quiz taking interface
│   ├── question-renderer.tsx  // Renders different question types
│   └── quiz-results.tsx       // Results and feedback display
├── assignment-builder/
│   ├── assignment-form.tsx    // Assignment creation
│   └── rubric-builder.tsx     // Grading rubric creation
└── assignment-submission/
    ├── submission-form.tsx    // Student submission interface
    └── grading-interface.tsx  // Teacher grading interface
```

### 5. Service Layer Design

#### 5.1 XP Service

```typescript
// lib/services/xp-service.ts
export class XPService {
  static async awardXP(userId: string, amount: number, reason: string, sourceType: string, sourceId?: string)
  static async getUserXP(userId: string)
  static async calculateLevel(totalXP: number)
  static async getLeaderboard(timeframe: 'weekly' | 'monthly' | 'all-time')
  static async checkLevelUp(userId: string, oldXP: number, newXP: number)
}
```

#### 5.2 Achievement Service

```typescript
// lib/services/achievement-service.ts
export class AchievementService {
  static async checkAchievements(userId: string, eventType: string, eventData: any)
  static async awardAchievement(userId: string, achievementId: string)
  static async getUserAchievements(userId: string)
  static async createAchievement(achievementData: AchievementData)
}
```

#### 5.3 Quiz Service

```typescript
// lib/services/quiz-service.ts
export class QuizService {
  static async createQuiz(quizData: QuizData)
  static async submitQuizAttempt(userId: string, quizId: string, answers: any[])
  static async gradeQuiz(attempt: QuizAttempt)
  static async getQuizAnalytics(quizId: string)
}
```

### 6. Real-time Features

#### 6.1 WebSocket Implementation

```typescript
// lib/websocket/events.ts
export enum WebSocketEvents {
  XP_AWARDED = 'xp_awarded',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  LEVEL_UP = 'level_up',
  STREAK_UPDATED = 'streak_updated'
}

// hooks/use-websocket.ts
export function useWebSocket(userId: string) {
  // WebSocket connection and event handling
}
```

### 7. Caching Strategy

#### 7.1 Redis Caching

```typescript
// lib/cache/redis-client.ts
export class CacheService {
  static async getLeaderboard(timeframe: string)
  static async setLeaderboard(timeframe: string, data: any, ttl: number)
  static async getUserXP(userId: string)
  static async invalidateUserCache(userId: string)
}
```

### 8. Performance Optimizations

#### 8.1 Database Optimizations
- Proper indexing on frequently queried fields
- Pagination for leaderboards and history
- Aggregation queries for analytics
- Connection pooling for high concurrency

#### 8.2 Frontend Optimizations
- React.memo for expensive components
- Virtual scrolling for large lists
- Lazy loading for non-critical features
- Image optimization for achievements and certificates

### 9. Security Considerations

#### 9.1 Data Protection
- Input validation and sanitization
- Rate limiting for XP-related endpoints
- Secure file upload handling
- Certificate verification system

#### 9.2 Anti-Cheating Measures
- Server-side quiz validation
- Time-based submission tracking
- Attempt limit enforcement
- Suspicious activity detection

### 10. Testing Strategy

#### 10.1 Unit Tests
- Service layer functions
- Utility functions
- Component logic

#### 10.2 Integration Tests
- API endpoint testing
- Database operations
- XP calculation accuracy

#### 10.3 E2E Tests
- Complete user journeys
- Quiz taking flow
- Achievement unlocking
- Certificate generation

### 11. Migration Strategy

#### 11.1 Database Migration Plan
1. **Phase 1**: Add new tables without breaking existing functionality
2. **Phase 2**: Migrate existing user progress to new XP system
3. **Phase 3**: Add foreign key constraints and indexes
4. **Phase 4**: Clean up legacy data structures

#### 11.2 Feature Flag Implementation
```typescript
// lib/feature-flags.ts
export const FeatureFlags = {
  GAMIFICATION_ENABLED: process.env.FEATURE_GAMIFICATION === 'true',
  QUIZ_SYSTEM_ENABLED: process.env.FEATURE_QUIZ_SYSTEM === 'true',
  ASSIGNMENTS_ENABLED: process.env.FEATURE_ASSIGNMENTS === 'true',
  CERTIFICATES_ENABLED: process.env.FEATURE_CERTIFICATES === 'true'
}
```

### 12. Monitoring and Analytics

#### 12.1 Application Metrics
- XP distribution analytics
- Quiz completion rates
- Assignment submission patterns
- Achievement unlock frequency
- User engagement metrics

#### 12.2 Performance Monitoring
- API response times
- Database query performance
- WebSocket connection stability
- Cache hit rates

### 13. Deployment Strategy

#### 13.1 Environment Setup
```bash
# Development
npm run dev

# Staging
npm run build:staging
npm run start:staging

# Production
npm run build:production
npm run start:production
```

#### 13.2 CI/CD Pipeline
1. **Code Quality**: ESLint, Prettier, TypeScript checks
2. **Testing**: Unit tests, integration tests
3. **Build**: Next.js production build
4. **Database**: Prisma migrations
5. **Deploy**: Vercel/AWS deployment
6. **Post-deploy**: Health checks and monitoring

This implementation design provides a comprehensive roadmap for building the enhanced LMS features while maintaining the existing system's stability and performance.
