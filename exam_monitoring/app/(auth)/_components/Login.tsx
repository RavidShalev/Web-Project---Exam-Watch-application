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

    if (!res.ok) {
      setError("תעודת הזהות או הסיסמה שגויים");
      return;
    }

    // Parse the JSON response returned from the server
    const user = await res.json();

    if (user.role === "supervisor") {
      localStorage.setItem("supervisorId", user._id);
    }

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
        >
          <input
            ref={userRef}
            value={idNumber}
            onChange={(e) => handleChange("user", e)}
            placeholder="תעודת זהות"
            className="input-field"
          />

          <input
            ref={passRef}
            type="password"
            value={password}
            onChange={(e) => handleChange("pass", e)}
            placeholder="סיסמה"
            className="input-field"
          />

          {error && (
            <p className="text-sm text-[var(--danger)] text-center">
              {error}
            </p>
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
