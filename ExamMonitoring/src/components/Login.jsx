import { useState, useRef } from 'react'; 

function Login() {
  // state hook - for memory
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 

  // ref hook - for direct element access - for delte values later
  const userRef = useRef(null);
  const passRef = useRef(null);

  // Handler for text input change - creating a new event listener
  const handleChange = (val, e) => {
    if (val === "pass") { //check if this is password field change
      setPassword(e.target.value); // e-writing event, target-the element, value-the new value
    } else {
      setUsername(e.target.value);
    }
  };

  // Handler for form submission
  const handleLogin = (e) => {
    e.preventDefault(); //instead of refresh the page on submit we prevent default behavior
    if (username.trim() === "" || password.trim() === "") {// Validation:Check if fields are empty
      setError("Please enter both username and password.");
      return;
    }

    // Success Logic: Save to Session Storage in the web browser not in our DB
    sessionStorage.setItem("currentUser", JSON.stringify({ username }));
    
    // Clear states and fields
    setUsername("");
    setPassword("");
    setError("");
    
    // Clear with Refs 
    if(userRef.current) userRef.current.value = "";
    if(passRef.current) passRef.current.value = "";
    
    alert("Logged in!");
  };

  // build the component - what return - in style
  return (
    // the main container
    <div className="flex items-center justify-center min-h-[84vh] bg-[#1b2430]">
      
      {/* another container to be the shadow behind the form */}
      <div className="bg-[#232d3b] p-8 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.3)] w-96 border border-[#2e3b4e]">
        
        {/* header */}
        <h2 className="text-3xl font-bold text-[#17cf97] mb-6 text-center tracking-wide">
          Welcome Back
        </h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          
          {/* Username field */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-semibold">Username</label>
            <input 
              type="text" 
              ref={userRef} // Connected Ref
              value={username} // the input value from state
              onChange={(e) => handleChange("user", e)} // Using the guide's handler
              className="bg-[#1b2430] text-white border border-gray-600 rounded-md p-3 focus:outline-none focus:border-[#17cf97] transition duration-300"
              placeholder="Enter your username"
            />
          </div>

          {/* password field */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-semibold">Password</label>
            <input 
              type="password" 
              ref={passRef} // Connected Ref
              value={password} // the input value from state
              onChange={(e) => handleChange("pass", e)} 
              className="bg-[#1b2430] text-white border border-gray-600 rounded-md p-3 focus:outline-none focus:border-[#17cf97] transition duration-300"
              placeholder="Enter your password"
            />
          </div>

          {/* Error Message Display */}
          {error && (
            <p style={{ color: "red", fontSize: "14px", textAlign: "center" }}>
              {error}
            </p>
          )}

          {/* the login button */}
          <button 
            type="submit"
            className="mt-4 bg-[#17cf97] text-[#1b2430] font-bold py-3 rounded-md hover:bg-[#12a87a] hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            Login
          </button>
        </form>

        {/* the sentence in the end of lost password */}
        <p className="text-gray-400 text-xs text-center mt-6">
          Lost your password? <span className="text-[#17cf97] cursor-pointer hover:underline">Click here</span>
        </p>
      </div>
    </div>
  );
}

export default Login;