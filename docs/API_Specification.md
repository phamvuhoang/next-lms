# API Specification
## Enhanced LMS with Gamification Features

### 1. Overview

This document provides comprehensive API specifications for the enhanced LMS system, including gamification, quiz system, assignments, and social features.

### 2. Authentication

All API endpoints require authentication via Clerk. Include the authorization header:
```
Authorization: Bearer <clerk_session_token>
```

### 3. XP and Gamification APIs

#### 3.1 User XP Management

##### GET /api/xp/[userId]
Get user's XP data and level information.

**Response:**
```typescript
{
  "userId": "user_123",
  "totalXP": 1250,
  "level": 8,
  "currentLevelXP": 150,
  "xpToNextLevel": 350,
  "rank": 42,
  "transactions": [
    {
      "id": "txn_123",
      "amount": 50,
      "reason": "Chapter completion",
      "sourceType": "chapter",
      "sourceId": "chapter_456",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

##### POST /api/xp/award
Award XP to a user (internal use).

**Request:**
```typescript
{
  "userId": "user_123",
  "amount": 50,
  "reason": "Quiz completion",
  "sourceType": "quiz",
  "sourceId": "quiz_789"
}
```

**Response:**
```typescript
{
  "success": true,
  "newTotalXP": 1300,
  "levelUp": false,
  "newLevel": 8
}
```

##### GET /api/xp/leaderboard
Get XP leaderboard with pagination.

**Query Parameters:**
- `timeframe`: "weekly" | "monthly" | "all-time"
- `limit`: number (default: 50)
- `offset`: number (default: 0)

**Response:**
```typescript
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user_456",
      "username": "john_doe",
      "avatar": "https://...",
      "xp": 5420,
      "level": 15,
      "change": 2
    }
  ],
  "userRank": 42,
  "totalUsers": 1250
}
```

#### 3.2 Achievement System

##### GET /api/achievements
Get all available achievements.

**Response:**
```typescript
{
  "achievements": [
    {
      "id": "ach_123",
      "name": "First Steps",
      "description": "Complete your first chapter",
      "icon": "🎯",
      "category": "learning",
      "xpReward": 25,
      "rarity": "common",
      "condition": {
        "type": "chapter_completion",
        "count": 1
      }
    }
  ]
}
```

##### GET /api/achievements/[userId]
Get user's achievements and progress.

**Response:**
```typescript
{
  "unlockedAchievements": [
    {
      "achievementId": "ach_123",
      "unlockedAt": "2024-01-15T10:30:00Z",
      "achievement": { /* achievement object */ }
    }
  ],
  "progressTowards": [
    {
      "achievementId": "ach_456",
      "currentProgress": 3,
      "requiredProgress": 10,
      "percentage": 30
    }
  ]
}
```

##### POST /api/achievements/check
Check and award achievements for a user.

**Request:**
```typescript
{
  "userId": "user_123",
  "eventType": "chapter_completion",
  "eventData": {
    "chapterId": "chapter_456",
    "courseId": "course_789"
  }
}
```

#### 3.3 Streak System

##### GET /api/streaks/[userId]
Get user's streak information.

**Response:**
```typescript
{
  "currentStreak": 15,
  "longestStreak": 42,
  "lastActivityDate": "2024-01-15",
  "freezesUsed": 1,
  "freezesAvailable": 2,
  "streakCalendar": [
    {
      "date": "2024-01-15",
      "hasActivity": true,
      "xpEarned": 75
    }
  ]
}
```

##### POST /api/streaks/[userId]/freeze
Use a streak freeze.

**Response:**
```typescript
{
  "success": true,
  "freezesRemaining": 1,
  "message": "Streak freeze applied successfully!"
}
```

### 4. Quiz System APIs

#### 4.1 Quiz Management

##### GET /api/quizzes
Get quizzes with filtering and pagination.

**Query Parameters:**
- `courseId`: string (optional)
- `chapterId`: string (optional)
- `published`: boolean (optional)
- `limit`: number (default: 20)
- `offset`: number (default: 0)

**Response:**
```typescript
{
  "quizzes": [
    {
      "id": "quiz_123",
      "title": "JavaScript Basics Quiz",
      "description": "Test your knowledge of JavaScript fundamentals",
      "chapterId": "chapter_456",
      "courseId": "course_789",
      "timeLimit": 30,
      "maxAttempts": 3,
      "passingScore": 70,
      "xpReward": 25,
      "questionCount": 10,
      "isPublished": true,
      "userAttempts": 1,
      "bestScore": 85
    }
  ],
  "total": 25,
  "hasMore": true
}
```

##### POST /api/quizzes
Create a new quiz (teacher only).

**Request:**
```typescript
{
  "title": "React Hooks Quiz",
  "description": "Test your understanding of React Hooks",
  "chapterId": "chapter_789",
  "timeLimit": 45,
  "maxAttempts": 3,
  "passingScore": 75,
  "xpReward": 30
}
```

##### GET /api/quizzes/[quizId]
Get quiz details with questions.

**Response:**
```typescript
{
  "id": "quiz_123",
  "title": "JavaScript Basics Quiz",
  "description": "Test your knowledge...",
  "timeLimit": 30,
  "maxAttempts": 3,
  "passingScore": 70,
  "questions": [
    {
      "id": "q_123",
      "type": "multiple_choice",
      "question": "What is the correct way to declare a variable in JavaScript?",
      "options": [
        "var myVar = 5;",
        "variable myVar = 5;",
        "v myVar = 5;",
        "declare myVar = 5;"
      ],
      "points": 1,
      "order": 1
    }
  ],
  "userAttempts": [
    {
      "id": "attempt_456",
      "score": 85,
      "completedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### 4.2 Quiz Attempts

##### POST /api/quizzes/[quizId]/attempt
Submit a quiz attempt.

**Request:**
```typescript
{
  "answers": [
    {
      "questionId": "q_123",
      "answer": "var myVar = 5;"
    },
    {
      "questionId": "q_124",
      "answer": ["option1", "option3"]
    }
  ],
  "timeSpent": 1200
}
```

**Response:**
```typescript
{
  "attemptId": "attempt_789",
  "score": 85,
  "totalPoints": 10,
  "passed": true,
  "xpAwarded": 25,
  "feedback": [
    {
      "questionId": "q_123",
      "correct": true,
      "explanation": "Correct! 'var' is one way to declare variables in JavaScript."
    }
  ],
  "achievements": ["ach_quiz_master"]
}
```

##### GET /api/quizzes/[quizId]/attempts
Get user's quiz attempts.

**Response:**
```typescript
{
  "attempts": [
    {
      "id": "attempt_456",
      "score": 85,
      "totalPoints": 10,
      "timeSpent": 1200,
      "completedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "bestScore": 85,
  "averageScore": 78,
  "attemptsRemaining": 2
}
```

### 5. Assignment System APIs

#### 5.1 Assignment Management

##### GET /api/assignments
Get assignments with filtering.

**Query Parameters:**
- `courseId`: string (optional)
- `chapterId`: string (optional)
- `status`: "upcoming" | "active" | "overdue" | "completed" (optional)

**Response:**
```typescript
{
  "assignments": [
    {
      "id": "assign_123",
      "title": "Build a React Component",
      "description": "Create a reusable React component...",
      "dueDate": "2024-01-20T23:59:59Z",
      "maxPoints": 100,
      "xpReward": 50,
      "status": "active",
      "submission": {
        "id": "sub_456",
        "submittedAt": "2024-01-18T15:30:00Z",
        "score": 92,
        "feedback": "Excellent work!"
      }
    }
  ]
}
```

##### POST /api/assignments
Create a new assignment (teacher only).

**Request:**
```typescript
{
  "title": "CSS Grid Layout",
  "description": "Create a responsive layout using CSS Grid",
  "chapterId": "chapter_456",
  "dueDate": "2024-01-25T23:59:59Z",
  "maxPoints": 100,
  "allowLateSubmission": true,
  "xpReward": 60
}
```

#### 5.2 Assignment Submissions

##### POST /api/assignments/[assignmentId]/submit
Submit an assignment.

**Request:**
```typescript
{
  "content": "Here is my solution...",
  "fileUrls": [
    "https://uploadthing.com/file1.zip",
    "https://uploadthing.com/file2.pdf"
  ]
}
```

**Response:**
```typescript
{
  "submissionId": "sub_789",
  "submittedAt": "2024-01-18T15:30:00Z",
  "status": "submitted",
  "message": "Assignment submitted successfully!"
}
```

##### PATCH /api/assignments/[assignmentId]/submissions/[submissionId]/grade
Grade an assignment submission (teacher only).

**Request:**
```typescript
{
  "score": 92,
  "feedback": "Excellent work! Your implementation is clean and efficient."
}
```

### 6. Analytics APIs

#### 6.1 Student Analytics

##### GET /api/analytics/student/[userId]
Get comprehensive student analytics.

**Response:**
```typescript
{
  "overview": {
    "totalXP": 1250,
    "level": 8,
    "coursesCompleted": 3,
    "currentStreak": 15,
    "totalStudyTime": 4800
  },
  "learningVelocity": {
    "chaptersPerWeek": 5.2,
    "quizAccuracy": 87,
    "averageSessionTime": 45
  },
  "skillProgress": [
    {
      "skill": "JavaScript",
      "level": 7,
      "progress": 75
    }
  ],
  "weeklyActivity": [
    {
      "date": "2024-01-15",
      "xpEarned": 75,
      "timeSpent": 60,
      "activitiesCompleted": 3
    }
  ]
}
```

#### 6.2 Teacher Analytics

##### GET /api/analytics/teacher/courses/[courseId]
Get course analytics for teachers.

**Response:**
```typescript
{
  "enrollment": {
    "total": 150,
    "active": 120,
    "completed": 25
  },
  "engagement": {
    "averageProgress": 65,
    "completionRate": 78,
    "averageRating": 4.6
  },
  "quizPerformance": {
    "averageScore": 82,
    "passRate": 89,
    "mostDifficultQuestions": ["q_123", "q_456"]
  },
  "assignmentPerformance": {
    "submissionRate": 92,
    "averageScore": 85,
    "onTimeSubmissions": 78
  }
}
```

### 7. Social Features APIs

#### 7.1 Leaderboards

##### GET /api/social/leaderboards/friends/[userId]
Get friend leaderboard.

**Response:**
```typescript
{
  "friends": [
    {
      "userId": "user_456",
      "username": "jane_doe",
      "avatar": "https://...",
      "xp": 1450,
      "level": 9,
      "rank": 1
    }
  ],
  "userRank": 3
}
```

#### 7.2 Study Groups

##### GET /api/social/study-groups
Get user's study groups.

**Response:**
```typescript
{
  "groups": [
    {
      "id": "group_123",
      "name": "React Developers",
      "description": "Learning React together",
      "memberCount": 12,
      "isOwner": true,
      "recentActivity": [
        {
          "type": "member_joined",
          "username": "new_user",
          "timestamp": "2024-01-15T10:30:00Z"
        }
      ]
    }
  ]
}
```

### 8. Error Handling

All APIs follow consistent error response format:

```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123456"
}
```

### 9. Rate Limiting

- **General APIs**: 100 requests per minute per user
- **XP Award APIs**: 10 requests per minute per user
- **Quiz Submission**: 5 requests per minute per user
- **File Upload**: 20 requests per hour per user

### 10. Webhooks

#### 10.1 Achievement Unlocked
```typescript
{
  "event": "achievement.unlocked",
  "data": {
    "userId": "user_123",
    "achievementId": "ach_456",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### 10.2 Level Up
```typescript
{
  "event": "user.level_up",
  "data": {
    "userId": "user_123",
    "oldLevel": 7,
    "newLevel": 8,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

This API specification provides a comprehensive foundation for implementing the enhanced LMS features with proper error handling, authentication, and scalability considerations.
