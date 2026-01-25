# 📝 Exam Watch - מערכת ניטור בחינות

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)

**מערכת מקיפה לניהול והשגחה על בחינות במכללת בראודה להנדסה**

### 🌐 [צפה באתר החי](https://web-project-exam-watch-application.vercel.app/)

[🚀 התחלה מהירה](#-התחלה-מהירה) • [📖 תיעוד](#-תכונות-עיקריות) • [🛠️ טכנולוגיות](#️-טכנולוגיות)

</div>

---

## 📋 תוכן עניינים

- [אודות הפרויקט](#-אודות-הפרויקט)
- [Demo חי](#-demo-חי)
- [תכונות עיקריות](#-תכונות-עיקריות)
- [טכנולוגיות](#️-טכנולוגיות)
- [התחלה מהירה](#-התחלה-מהירה)
- [מבנה הפרויקט](#-מבנה-הפרויקט)
- [תפקידי משתמשים](#-תפקידי-משתמשים)
- [תכונות מתקדמות](#-תכונות-מתקדמות)
- [API חיצוני](#-api-חיצוני)

---

## 🎯 אודות הפרויקט

**Exam Watch** היא מערכת ווב מתקדמת לניהול והשגחה על בחינות אקדמיות. המערכת מאפשרת למשגיחים, מרצים ומנהלים לנהל את תהליך הבחינה בצורה יעילה ודיגיטלית.

### הבעיה שאנו פותרים:
- ✅ מעבר מניהול ידני של בחינות לניהול דיגיטלי
- ✅ מעקב נוכחות בזמן אמת
- ✅ דיווח אירועים מיידי
- ✅ גישה מהירה לנהלי בחינות באמצעות AI
- ✅ תקשורת בין משגיחים במהלך הבחינה
- ✅ התראות חכמות ואוטומטיות

---

## 🌐 Demo חי

האפליקציה זמינה באופן מקוון:

**🔗 [https://web-project-exam-watch-application.vercel.app/](https://web-project-exam-watch-application.vercel.app/)**

> המערכת מתארחת ב-Vercel עם חיבור ל-MongoDB Atlas

---

## ✨ תכונות עיקריות

### 👨‍💼 למנהלים (Admin)
- 📊 לוח בקרה עם סטטיסטיקות בזמן אמת
- 👥 ניהול משתמשים (רישום, עריכה, מחיקה)
- 📝 יצירת מבחנים ידנית או באמצעות CSV
- 📋 צפייה בלוגים של פעילות המערכת (Audit Logs)
- 🗺️ מפת כיתות עם שיבוץ משגיחים

### 👁️ למשגיחים (Supervisor)
- ⏱️ שעון מבחן עם ספירה לאחור
- 📋 רשימת נוכחות אינטראקטיבית
- 🚨 דיווח אירועים (העתקה, הפרעה, בעיות טכניות)
- 🤖 **בוט AI חכם** למענה על שאלות בזמן אמת
- 🚽 מעקב יציאה לשירותים
- ➕ הוספת זמן לסטודנטים עם התאמות
- 💬 **תקשורת בין משגיחים** - הודעות ועדכוני סטטוס
- 🔔 **עוזר חכם (SmartBotAssistant)** - התראות והנחיות במהלך הבחינה
- 🔄 העברת סטודנטים בין כיתות
- 📞 קריאה למרצה

### 👨‍🏫 למרצים (Lecturer)
- 📈 צפייה במבחנים פעילים בזמן אמת
- 📊 דוחות מפורטים לאחר סיום מבחן
- 📥 ייצוא דוחות ל-Excel ו-PDF
- 🔔 התראות קריאה מהמשגיחים

### 👨‍🎓 לסטודנטים (Student)
- 📅 צפייה במבחנים קרובים
- 📍 מידע על מיקום וכללי המבחן
- 📖 גישה לנהלי בחינות

---

## 🛠️ טכנולוגיות

| קטגוריה | טכנולוגיה |
|---------|-----------|
| **Frontend** | Next.js 15, React 18, TypeScript |
| **Styling** | Tailwind CSS, CSS Variables (Dark/Light mode) |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **AI** | Google Gemini API (בוט הבחינות) |
| **Auth** | bcryptjs (הצפנת סיסמאות) |
| **Icons** | Lucide React |
| **Export** | jsPDF, SheetJS (xlsx) |
| **Real-time** | Polling-based updates (כל 10 שניות) |
| **Deployment** | Vercel |

---

## 🚀 התחלה מהירה

### דרישות מקדימות
- Node.js 18+
- npm / yarn / pnpm
- חשבון MongoDB Atlas
- מפתח API של Google Gemini

### התקנה

1. **שכפול הפרויקט**
```bash
git clone https://github.com/your-username/Web-Project---Exam-Watch-application.git
cd Web-Project---Exam-Watch-application/exam_monitoring
```

2. **התקנת תלויות**
```bash
npm install
```

3. **הגדרת משתני סביבה**

צור קובץ `.env.local` בתיקיית `exam_monitoring`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/exam_monitoring
GEMINI_API_KEY=your_gemini_api_key
```

4. **הרצת שרת הפיתוח**
```bash
npm run dev
```

5. **פתח את הדפדפן**

נווט ל-[http://localhost:3000](http://localhost:3000)

---

## 📁 מבנה הפרויקט

```
exam_monitoring/
├── app/                         # 📁 התיקייה הראשית של Next.js App Router
│   │
│   ├── (auth)/                  # 📁 Route Group - דפי אימות (בלי Navbar)
│   │   ├── page.tsx             # דף ההתחברות הראשי (/)
│   │   └── _components/         # רכיבים פרטיים לאימות
│   │       └── Login.tsx        # טופס התחברות
│   │
│   ├── (main)/                  # 📁 Route Group - דפים ראשיים (עם Navbar)
│   │   ├── layout.tsx           # Layout משותף עם Navbar
│   │   │
│   │   ├── home/                # 📁 דף הבית (/home)
│   │   │   ├── page.tsx         # דף הבית הראשי
│   │   │   └── _components/     # רכיבי דף הבית
│   │   │       ├── AdminDashboard.tsx      # דשבורד למנהל
│   │   │       ├── SupervisorDashboard.tsx # דשבורד למשגיח
│   │   │       ├── LecturerDashboard.tsx   # דשבורד למרצה
│   │   │       ├── StudentDashboard.tsx    # דשבורד לסטודנט
│   │   │       └── ReadyForExams.tsx       # רכיב מבחנים מוכנים
│   │   │
│   │   ├── active-exam/         # 📁 מסך מבחן פעיל
│   │   │   └── [examId]/        # Dynamic route - לפי ID מבחן
│   │   │       ├── page.tsx              # דף המבחן הפעיל
│   │   │       ├── CommunicationPanel.tsx # פאנל תקשורת בין משגיחים
│   │   │       └── _components/          # רכיבי מבחן פעיל
│   │   │           ├── examTimer.tsx         # טיימר מבחן
│   │   │           ├── attendanceList.tsx    # רשימת נוכחות
│   │   │           ├── reportModal.tsx       # מודל דיווח כללי
│   │   │           ├── reportEvents.tsx      # דיווחי אירועים לסטודנט
│   │   │           ├── SmartBotAssistant.tsx # עוזר AI חכם עם התראות
│   │   │           ├── CallLecturerModal.tsx # קריאה למרצה
│   │   │           ├── AddStudentModal.tsx   # הוספת סטודנט
│   │   │           ├── addTimeModal.tsx      # הוספת זמן
│   │   │           └── TransferStudentModal.tsx # העברת סטודנט
│   │   │
│   │   ├── exam-bot/            # 📁 בוט AI (/exam-bot)
│   │   │   └── page.tsx         # ממשק צ'אט עם Gemini
│   │   │
│   │   ├── procedures/          # 📁 נהלי בחינות (/procedures)
│   │   │   ├── page.tsx         # דף הנהלים
│   │   │   └── _components/
│   │   │       └── ProcedureCard.tsx # כרטיס נוהל
│   │   │
│   │   ├── class-map/           # 📁 מפת כיתות (/class-map)
│   │   │   ├── page.tsx         # דף המפה
│   │   │   ├── _components/
│   │   │   │   ├── ClassCard.tsx  # כרטיס כיתה
│   │   │   │   └── ClassGrid.tsx  # רשת כיתות
│   │   │   └── data/
│   │   │       └── classRoomType.ts # טיפוס כיתה
│   │   │
│   │   ├── add-exam/            # 📁 הוספת מבחן - Admin (/add-exam)
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   │       ├── AddExam.tsx       # טופס הוספה
│   │   │       ├── ExamsTable.tsx    # טבלת מבחנים
│   │   │       └── UploadExamCsv.tsx # העלאת CSV
│   │   │
│   │   ├── edit-exam/           # 📁 עריכת מבחן
│   │   │   ├── [examId]/
│   │   │   │   └── page.tsx
│   │   │   └── _components/
│   │   │       ├── EditExam.tsx
│   │   │       ├── ExamStudentsTable.tsx
│   │   │       └── UploadStudentsCsv.tsx
│   │   │
│   │   ├── register-user/       # 📁 רישום משתמש - Admin
│   │   │   └── page.tsx         # טופס רישום
│   │   │
│   │   ├── admin/               # 📁 דפי ניהול
│   │   │   └── audit-logs/
│   │   │       └── page.tsx     # יומן פעולות
│   │   │
│   │   ├── exam-reports/        # 📁 דוחות מבחן
│   │   │   └── [examId]/
│   │   │       └── page.tsx     # דוח מבחן ספציפי
│   │   │
│   │   └── lecturer-view/       # 📁 תצוגת מרצה
│   │       └── [examId]/
│   │           └── page.tsx     # צפייה במבחן פעיל
│   │
│   ├── api/                     # 📁 API Routes (Backend!)
│   │   ├── login/
│   │   │   └── route.ts         # POST /api/login
│   │   ├── users/
│   │   │   └── route.ts         # GET, POST /api/users
│   │   ├── exams/
│   │   │   ├── route.ts         # GET, POST /api/exams
│   │   │   ├── [examId]/
│   │   │   │   ├── route.ts     # GET, PUT, PATCH, DELETE
│   │   │   │   ├── addTime/
│   │   │   │   ├── call-lecturer/
│   │   │   │   ├── reporting/
│   │   │   │   ├── messages/    # הודעות בין משגיחים
│   │   │   │   └── supervisor-status/ # סטטוס משגיחים
│   │   │   ├── activate/
│   │   │   ├── activeByCourse/
│   │   │   ├── attendance/
│   │   │   ├── closest/
│   │   │   ├── lecturer/
│   │   │   └── student/
│   │   ├── procedures/
│   │   │   └── route.ts         # GET /api/procedures
│   │   ├── class-map/
│   │   │   └── route.ts         # GET /api/class-map
│   │   ├── exam-bot/
│   │   │   └── route.ts         # POST /api/exam-bot (Gemini AI)
│   │   └── admin/
│   │       ├── audit-logs/
│   │       └── exams/
│   │
│   ├── components/              # 📁 רכיבים משותפים (גלובליים)
│   │   ├── Navbar.tsx           # תפריט ניווט
│   │   ├── ThemeToggle.tsx      # מתג Dark/Light mode
│   │   └── ToastProvider.tsx    # הודעות Toast
│   │
│   ├── lib/                     # 📁 פונקציות עזר ושירותים
│   │   ├── db.js                # חיבור ל-MongoDB
│   │   ├── auditLogger.ts       # לוגים לפעולות
│   │   └── TimeUtils.ts         # פונקציות זמן
│   │
│   ├── models/                  # 📁 Mongoose Models (Database Schemas)
│   │   ├── Users.ts             # סכמת משתמשים
│   │   ├── Exams.ts             # סכמת מבחנים
│   │   ├── Attendance.ts        # סכמת נוכחות
│   │   ├── Procedure.ts         # סכמת נהלים
│   │   ├── Report.ts            # סכמת דיווחים
│   │   ├── AuditLog.ts          # סכמת לוגים
│   │   ├── AuditAction.ts       # טיפוסי פעולות
│   │   ├── Communication.ts     # סכמת הודעות בין משגיחים
│   │   ├── SupervisorStatus.ts  # סכמת סטטוס משגיח
│   │   └── ExamCsvRow.ts        # טיפוס שורת CSV
│   │
│   ├── layout.tsx               # Layout ראשי של האפליקציה
│   ├── providers.tsx            # Context Providers (Theme)
│   └── globals.css              # סגנונות CSS גלובליים
│
├── types/                       # 📁 TypeScript Type Definitions
│   ├── examtypes.ts             # טיפוסי מבחן
│   └── attendance.ts            # טיפוסי נוכחות
│
├── public/                      # 📁 קבצים סטטיים (תמונות, favicon)
│
├── package.json                 # תלויות ו-scripts
├── tsconfig.json                # הגדרות TypeScript
├── tailwind.config.ts           # הגדרות Tailwind CSS
└── next.config.ts               # הגדרות Next.js
```

---

## 👥 תפקידי משתמשים

| תפקיד | הרשאות |
|-------|--------|
| **Admin** | גישה מלאה - ניהול משתמשים, מבחנים, צפייה בלוגים, מפת כיתות |
| **Supervisor** | השגחה על מבחנים, דיווח אירועים, שימוש בבוט, תקשורת עם משגיחים |
| **Lecturer** | צפייה במבחנים, קבלת התראות, צפייה בדוחות |
| **Student** | צפייה במבחנים אישיים, נהלים |

---

## 🔔 תכונות מתקדמות

### 💬 תקשורת בין משגיחים (CommunicationPanel)
- שליחת הודעות בזמן אמת בין משגיחים באותו מבחן
- צפייה בסטטוס משגיחים (זמין, עסוק, בהפסקה)
- עדכון מיקום המשגיח בכיתה

### 🤖 עוזר חכם (SmartBotAssistant)
- התראות אוטומטיות במהלך הבחינה
- סיכום ביניים של מצב הנוכחות
- התראות על זמן שנותר
- שאלות מהירות לבוט AI

### 🚨 דיווח אירועים
- דיווח כללי על אירועים במבחן
- דיווח ספציפי לסטודנט (איחור, יציאה, חשד להעתקה)
- תיעוד אוטומטי ב-Audit Log

---

## 🤖 API חיצוני

### Google Gemini AI
המערכת משתמשת ב-**Google Gemini API** עבור בוט הבחינות החכם:
- מענה על שאלות בזמן אמת על נהלי בחינות
- תמיכה בעברית
- מבוסס על נוהל בחינות רשמי (אק-007-ע19)

---

## 👨‍💻 צוות הפיתוח

פותח במסגרת קורס **טכנולוגיות אינטרנט מתקדמות** במכללת בראודה להנדסה.

---

## 📄 רישיון

פרויקט זה נוצר למטרות לימודיות.

---

<div align="center">

**🌐 [צפה באתר החי](https://web-project-exam-watch-application.vercel.app/)**

**⭐ אם הפרויקט עזר לך, אל תשכח לתת כוכב! ⭐**

</div>
