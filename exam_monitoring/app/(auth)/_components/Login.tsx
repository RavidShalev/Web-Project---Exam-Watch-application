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
        "Content-Type" : "application/json",
    },
    // Send idNumber and password as JSON in the request body
    body : JSON.stringify({idNumber,password}),
  });

    if(!res.ok) {
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
    <div className="flex items-center justify-center min-h-[100vh] bg-[#1b2430]">
      <div className="bg-[#232d3b] p-8 rounded-xl shadow w-full max-w-sm">
        <h2 className="text-3xl font-bold text-[#17cf97] mb-6 text-center">
          ברוך שובך!
        </h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 text-white">
          <input
            ref={userRef}
            value={idNumber}
            onChange={(e) => handleChange("user", e)}
            placeholder="תעודת זהות"
            className="p-3 rounded"
          />

          <input
            ref={passRef}
            type="password"
            value={password}
            onChange={(e) => handleChange("pass", e)}
            placeholder="סיסמא"
            className="p-3 rounded"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="bg-[#17cf97] text-black font-bold py-2 rounded"
          >
            כניסה למערכת
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
