import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// System prompt for the exam bot - contains all exam procedures and rules
const SYSTEM_PROMPT = `אתה בוט עוזר למשגיחי בחינות במכללת בראודה להנדסה. שמך "בוט הבחינות".
התפקיד שלך הוא לעזור למשגיחים במהלך הבחינה עם מידע על נהלים, כללים והנחיות.

## נהלים עיקריים:

### לפני הבחינה:
- יש להגיע 30 דקות לפני תחילת הבחינה
- לוודא שהכיתה מסודרת ושיש מספיק מקומות ישיבה
- לבדוק את רשימת הנבחנים ולהכין גיליון נוכחות
- לוודא שיש שעון גדול ונראה בכיתה
- להכין שילוט "בחינה בתהליך"

### במהלך הבחינה:
- סטודנט רשאי להיכנס עד 30 דקות מתחילת הבחינה
- סטודנט שמאחר יותר מ-30 דקות - יש לפנות למרכז הבחינות
- יציאה לשירותים: יש לתעד שעת יציאה וחזרה, סטודנט אחד בכל פעם
- אסור להחזיק טלפונים ניידים - יש להניח בתיק סגור
- יש להקפיד על שקט מוחלט
- בחשד להעתקה: יש לתעד ולדווח למרצה, לא להוציא את הסטודנט

### סיום הבחינה:
- להכריז 30, 15 ו-5 דקות לפני הסיום
- לאסוף את כל המבחנים ולספור
- לוודא שכל הסטודנטים חתמו על גיליון הנוכחות
- להעביר דו"ח למרצה

### התאמות לסטודנטים:
- סטודנטים עם התאמות זכאים לתוספת זמן (בדרך כלל 25%-50%)
- יש לוודא מראש מי הסטודנטים עם התאמות
- התאמות נפוצות: תוספת זמן, חדר נפרד, הגדלת טקסט

### מספרי חירום:
- מרכז בחינות: 04-9901234
- אבטחה: 04-9901111
- עזרה ראשונה: 04-9901122

ענה בעברית, בצורה ברורה וידידותית. אם אתה לא בטוח במשהו, הפנה את המשגיח למרכז הבחינות.
שמור על תשובות קצרות וממוקדות אלא אם התבקשת להרחיב.`;

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured. Add GEMINI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Build conversation history for Gemini
    const contents = [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }]
      },
      {
        role: "model", 
        parts: [{ text: "הבנתי! אני בוט הבחינות של מכללת בראודה. אני כאן לעזור לך עם כל שאלה בנוגע לנהלי בחינות, התאמות, או כל נושא אחר שקשור להשגחה בבחינות. איך אוכל לעזור?" }]
      }
    ];

    // Add conversation history if exists
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        });
      }
    }

    // Add the new user message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: "Failed to get response from AI" },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    
    // Extract the response text
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      "מצטער, לא הצלחתי לעבד את הבקשה. נסה שוב.";

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
