# 📝 Exam Watch - מערכת ניטור בחינות

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)

**מערכת מקיפה לניהול והשגחה על בחינות במכללת בראודה להנדסה**

[🚀 התחלה מהירה](#-התחלה-מהירה) • [📖 תיעוד](#-תכונות-עיקריות) • [🛠️ טכנולוגיות](#️-טכנולוגיות)

</div>

---

## 📋 תוכן עניינים

- [אודות הפרויקט](#-אודות-הפרויקט)
- [תכונות עיקריות](#-תכונות-עיקריות)
- [טכנולוגיות](#️-טכנולוגיות)
- [התחלה מהירה](#-התחלה-מהירה)
- [מבנה הפרויקט](#-מבנה-הפרויקט)
- [תפקידי משתמשים](#-תפקידי-משתמשים)
- [API חיצוני](#-api-חיצוני)

---

## 🎯 אודות הפרויקט

**Exam Watch** היא מערכת ווב מתקדמת לניהול והשגחה על בחינות אקדמיות. המערכת מאפשרת למשגיחים, מרצים ומנהלים לנהל את תהליך הבחינה בצורה יעילה ודיגיטלית.

### הבעיה שאנו פותרים:
- ✅ מעבר מניהול ידני של בחינות לניהול דיגיטלי
- ✅ מעקב נוכחות בזמן אמת
- ✅ דיווח אירועים מיידי
- ✅ גישה מהירה לנהלי בחינות באמצעות AI

---

## ✨ תכונות עיקריות

### 👨‍💼 למנהלים (Admin)
- 📊 לוח בקרה עם סטטיסטיקות בזמן אמת
- 👥 ניהול משתמשים (רישום, עריכה, מחיקה)
- 📝 יצירת מבחנים ידנית או באמצעות CSV
- 📋 צפייה בלוגים של פעילות המערכת

### 👁️ למשגיחים (Supervisor)
- ⏱️ שעון מבחן עם ספירה לאחור
- 📋 רשימת נוכחות אינטראקטיבית
- 🚨 דיווח אירועים (העתקה, הפרעה, בעיות טכניות)
- 🤖 **בוט AI חכם** למענה על שאלות בזמן אמת
- 🚽 מעקב יציאה לשירותים
- ➕ הוספת זמן לסטודנטים עם התאמות

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
├── app/
│   ├── (auth)/              # דפי התחברות
│   │   └── _components/
│   ├── (main)/              # דפים ראשיים (עם Navbar)
│   │   ├── home/            # דף הבית
│   │   ├── active-exam/     # מסך מבחן פעיל
│   │   ├── exam-bot/        # בוט AI
│   │   ├── procedures/      # נהלי בחינות
│   │   ├── class-map/       # מפת כיתות
│   │   ├── add-exam/        # הוספת מבחן (Admin)
│   │   ├── register-user/   # רישום משתמש (Admin)
│   │   ├── admin/           # דפי ניהול
│   │   ├── exam-reports/    # דוחות מבחן
│   │   └── lecturer-view/   # תצוגת מרצה
│   ├── api/                 # API Routes
│   │   ├── exams/
│   │   ├── users/
│   │   ├── attendance/
│   │   ├── reports/
│   │   ├── exam-bot/
│   │   └── admin/
│   ├── components/          # רכיבים משותפים
│   ├── lib/                 # פונקציות עזר
│   ├── models/              # Mongoose Models
│   └── globals.css          # סגנונות גלובליים
├── types/                   # TypeScript Types
└── public/                  # קבצים סטטיים
```

---

## 👥 תפקידי משתמשים

| תפקיד | הרשאות |
|-------|--------|
| **Admin** | גישה מלאה - ניהול משתמשים, מבחנים, צפייה בלוגים |
| **Supervisor** | השגחה על מבחנים, דיווח אירועים, שימוש בבוט |
| **Lecturer** | צפייה במבחנים, קבלת התראות, צפייה בדוחות |
| **Student** | צפייה במבחנים אישיים, נהלים |

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

**⭐ אם הפרויקט עזר לך, אל תשכח לתת כוכב! ⭐**

</div>
