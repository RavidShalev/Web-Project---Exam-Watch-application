"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, FormEvent } from "react";

function Login() {
  // state hook - for memory
  const [idNumber, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  // ref hook - for direct element access - for delte values later
  const userRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  // Handler for text input change - creating a new event listener
  const handleChange = (
    field: "user" | "pass",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (field === "pass") {  //check if this is password field change
      setPassword(e.target.value);  // e-writing event, target-the element, value-the new value
    } else {
      setUsername(e.target.value);
    }
  };

  // Handler for form submission
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();  //instead of refresh the page on submit we prevent default behavior

    if (!idNumber.trim() || !password.trim()) {
      setError("יש למלא את כל השדות");
      return;
    }

    // Send login request to api
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        // Inform the server that the request body is JSON
        "Content-Type": "application/json",
      },
      // Send idNumber and password as JSON in the request body
      body: JSON.stringify({ idNumber, password }),
    });

    console.log("sending:", { idNumber, password });

    // Parse the JSON response from the server (for both success and error)
    const data = await res.json();

    if (!res.ok) {
      // Display the server's error message (includes attempts left)
      setError(data.message || "תעודת הזהות או הסיסמה שגויים");
      return;
    }

    // On success, data contains user info
    const user = data;

    // שמירת userId לכל התפקידים (לשימוש בתקשורת P2P ועוד)
    sessionStorage.setItem("supervisorId", user._id);

    // Store authenticated user data in sessionStorage
    sessionStorage.setItem("currentUser", JSON.stringify(user));

    // Moving to home after a successful login
    router.push("/home");
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-[var(--surface)] px-4"
    >
      <div
        className="
          w-full max-w-sm
          rounded-3xl
          bg-[var(--bg)]
          border border-[var(--border)]
          shadow-sm
          p-6 sm:p-8
        "
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--accent)] mb-6 text-center">
          ברוך שובך!
        </h2>

        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-4"
          aria-label="טופס התחברות"
        >
          <div>
            <label htmlFor="idNumber" className="sr-only">
              תעודת זהות
            </label>
            <input
              id="idNumber"
              ref={userRef}
              value={idNumber}
              onChange={(e) => handleChange("user", e)}
              placeholder="תעודת זהות"
              className="input-field"
              aria-required="true"
              aria-invalid={error ? "true" : "false"}
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              סיסמה
            </label>
            <input
              id="password"
              ref={passRef}
              type="password"
              value={password}
              onChange={(e) => handleChange("pass", e)}
              placeholder="סיסמה"
              className="input-field"
              aria-required="true"
              aria-invalid={error ? "true" : "false"}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div 
              role="alert" 
              aria-live="polite"
              className="text-sm text-[var(--danger)] text-center"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="
              w-full
              rounded-2xl
              bg-[var(--accent)]
              py-3
              font-semibold
              text-white
              hover:brightness-110
              active:scale-[0.99]
              transition
            "
          >
            כניסה למערכת
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
