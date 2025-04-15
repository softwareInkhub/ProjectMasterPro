import React, { useState } from "react";

export default function TestLogin() {
  const [status, setStatus] = useState<string>("");

  const handleDemoLogin = async () => {
    try {
      setStatus("Logging in...");
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@example.com",
          password: "password123",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Login successful:", data);
        
        // Set token in localStorage
        localStorage.setItem("authToken", data.token);
        
        setStatus("Login successful! Token set in localStorage. Redirecting in 3 seconds...");
        
        // Redirect after delay
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } else {
        const error = await res.json();
        setStatus(`Login failed: ${error.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem" }}>Test Login Page</h1>
      
      <div style={{ marginBottom: "1rem" }}>
        This is a simplified login page to test the login functionality directly.
      </div>
      
      <button 
        onClick={handleDemoLogin}
        style={{
          padding: "0.5rem 1rem",
          background: "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: "0.25rem",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Login with Demo Account
      </button>
      
      {status && (
        <div style={{ 
          marginTop: "1rem", 
          padding: "1rem", 
          background: status.includes("successful") ? "#d1fae5" : "#fee2e2",
          borderRadius: "0.25rem"
        }}>
          {status}
        </div>
      )}
      
      <div style={{ marginTop: "2rem" }}>
        <h2>Debug Information:</h2>
        <pre style={{ 
          background: "#f3f4f6", 
          padding: "1rem", 
          borderRadius: "0.25rem",
          whiteSpace: "pre-wrap",
          overflow: "auto"
        }}>
          {`Current localStorage authToken: ${localStorage.getItem("authToken") || "not set"}`}
        </pre>
      </div>
    </div>
  );
}