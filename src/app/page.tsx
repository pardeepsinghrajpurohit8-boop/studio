"use client";

import { useState, useEffect } from "react";
import { PriceCalculator } from '@/components/price-calculator';

export default function Home() {
  // Screens: 'login' | 'signup' | 'dashboard'
  const [currentScreen, setCurrentScreen] = useState("login");
  
  // User Inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // App Data
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userList, setUserList] = useState<any>({}); // { "rahul": { pass: "123" } }

  // 1. Load existing users on app start
  useEffect(() => {
    const storedUsers = localStorage.getItem("my_app_users");
    if (storedUsers) {
      setUserList(JSON.parse(storedUsers));
    }
    // Check if a user is already logged in
    const loggedInUser = sessionStorage.getItem("my_app_currentUser");
    if (loggedInUser) {
        setCurrentUser(loggedInUser);
        setCurrentScreen("dashboard");
    }
  }, []);

  // --- SIGN UP LOGIC ---
  const handleSignup = () => {
    if (!username || !password) {
      alert("नाम और पासवर्ड दोनों लिखें!");
      return;
    }
    if (userList[username]) {
      alert("यह यूजरनेम पहले से बना हुआ है! Login करें।");
      return;
    }

    // Create new user
    const newUserList = {
      ...userList,
      [username]: { password: password }
    };
    
    saveUsersToLocal(newUserList);
    alert("अकाउंट बन गया! अब Login करें।");
    setCurrentScreen("login");
  };

  // --- LOGIN LOGIC ---
  const handleLogin = () => {
    const user = userList[username];
    
    if (user && user.password === password) {
      setCurrentUser(username);
      sessionStorage.setItem("my_app_currentUser", username); // Save session
      setCurrentScreen("dashboard");
    } else {
      alert("गलत यूजरनेम या पासवर्ड!");
    }
  };

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem("my_app_currentUser");
    setUsername("");
    setPassword("");
    setCurrentScreen("login");
  };

  // Helper function to save users to local storage
  const saveUsersToLocal = (data: any) => {
    setUserList(data);
    localStorage.setItem("my_app_users", JSON.stringify(data));
  };

  // --- UI (User Interface) ---
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24 bg-background font-body">
      
      {/* 1. LOGIN SCREEN */}
      {currentScreen === "login" && (
        <div className="bg-card p-8 rounded-3xl shadow-[10px_10px_20px_#bebebe,_-10px_-10px_20px_#ffffff] w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-center text-foreground/90">Login करें</h2>
          <div className="space-y-4">
            <input 
              className="w-full border-none bg-transparent p-4 rounded-lg shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] focus-visible:ring-accent focus-visible:ring-2 focus-visible:ring-offset-0 transition-all duration-300"
              placeholder="यूजरनेम" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
            <input 
              className="w-full border-none bg-transparent p-4 rounded-lg shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] focus-visible:ring-accent focus-visible:ring-2 focus-visible:ring-offset-0 transition-all duration-300"
              placeholder="पासवर्ड" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button onClick={handleLogin} className="w-full mt-6 bg-primary text-primary-foreground p-3 rounded-lg font-bold hover:bg-primary/90">Login</button>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            अकाउंट नहीं है? <button onClick={() => setCurrentScreen("signup")} className="text-primary font-bold">Sign Up करें</button>
          </p>
        </div>
      )}

      {/* 2. SIGNUP SCREEN */}
      {currentScreen === "signup" && (
        <div className="bg-card p-8 rounded-3xl shadow-[10px_10px_20px_#bebebe,_-10px_-10px_20px_#ffffff] w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-center text-foreground/90">नया अकाउंट बनाएं</h2>
           <div className="space-y-4">
            <input 
                className="w-full border-none bg-transparent p-4 rounded-lg shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] focus-visible:ring-accent focus-visible:ring-2 focus-visible:ring-offset-0 transition-all duration-300"
                placeholder="अपना नया यूजरनेम चुनें" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
            />
            <input 
                className="w-full border-none bg-transparent p-4 rounded-lg shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] focus-visible:ring-accent focus-visible:ring-2 focus-visible:ring-offset-0 transition-all duration-300"
                placeholder="पासवर्ड चुनें" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button onClick={handleSignup} className="w-full mt-6 bg-primary text-primary-foreground p-3 rounded-lg font-bold hover:bg-primary/90">Sign Up</button>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            पहले से अकाउंट है? <button onClick={() => setCurrentScreen("login")} className="text-primary font-bold">Login करें</button>
          </p>
        </div>
      )}

      {/* 3. DASHBOARD (MAIN APP) */}
      {currentScreen === "dashboard" && currentUser && (
        <>
          <div className="absolute top-4 right-4 flex items-center gap-4">
             <span className="text-sm font-medium text-foreground/80">नमस्ते, {currentUser}! 👋</span>
             <button onClick={handleLogout} className="text-sm font-bold text-destructive px-3 py-1 rounded-lg hover:bg-destructive/10">Logout</button>
          </div>
          <PriceCalculator />
        </>
      )}

    </main>
  );
}
