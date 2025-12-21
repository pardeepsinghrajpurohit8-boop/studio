"use client";

import { useState, useEffect } from "react";

export default function Home() {
  // Screens: 'login' | 'signup' | 'dashboard'
  const [currentScreen, setCurrentScreen] = useState("login");
  
  // User Inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // App Data
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [todoInput, setTodoInput] = useState("");
  const [userList, setUserList] = useState<any>({}); // { "rahul": { pass: "123", data: [] } }

  // 1. ऐप खुलते ही पुराने यूजर्स को लोड करें
  useEffect(() => {
    const storedUsers = localStorage.getItem("my_app_users");
    if (storedUsers) {
      setUserList(JSON.parse(storedUsers));
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

    // नया यूजर बनाएं
    const newUserList = {
      ...userList,
      [username]: { password: password, data: [] } // खाली डेटा के साथ
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
      setCurrentScreen("dashboard");
    } else {
      alert("गलत यूजरनेम या पासवर्ड!");
    }
  };

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    setCurrentUser(null);
    setUsername("");
    setPassword("");
    setCurrentScreen("login");
  };

  // --- DATA SAVING (Dashboard) ---
  const handleAddTodo = () => {
    if (!currentUser || !todoInput) return;

    // यूजर का पुराना डेटा लें और नया जोड़ें
    const updatedData = [...userList[currentUser].data, todoInput];
    
    // पूरी लिस्ट अपडेट करें
    const updatedUserList = {
      ...userList,
      [currentUser]: { ...userList[currentUser], data: updatedData }
    };

    saveUsersToLocal(updatedUserList);
    setTodoInput("");
  };

  // लोकल स्टोरेज में सेव करने का फंक्शन
  const saveUsersToLocal = (data: any) => {
    setUserList(data);
    localStorage.setItem("my_app_users", JSON.stringify(data));
  };

  // --- UI (User Interface) ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans text-black">
      
      {/* 1. LOGIN SCREEN */}
      {currentScreen === "login" && (
        <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4 text-center">Login करें</h2>
          <input 
            className="w-full border p-2 mb-2 rounded" 
            placeholder="यूजरनेम" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
          <input 
            className="w-full border p-2 mb-4 rounded" 
            placeholder="पासवर्ड" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Login</button>
          <p className="mt-4 text-sm text-center">
            अकाउंट नहीं है? <button onClick={() => setCurrentScreen("signup")} className="text-blue-600 font-bold">Sign Up करें</button>
          </p>
        </div>
      )}

      {/* 2. SIGNUP SCREEN */}
      {currentScreen === "signup" && (
        <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4 text-center">नया अकाउंट बनाएं</h2>
          <input 
            className="w-full border p-2 mb-2 rounded" 
            placeholder="अपना नया यूजरनेम चुनें" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
          <input 
            className="w-full border p-2 mb-4 rounded" 
            placeholder="पासवर्ड चुनें" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button onClick={handleSignup} className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Sign Up</button>
          <p className="mt-4 text-sm text-center">
            पहले से अकाउंट है? <button onClick={() => setCurrentScreen("login")} className="text-blue-600 font-bold">Login करें</button>
          </p>
        </div>
      )}

      {/* 3. DASHBOARD (MAIN APP) */}
      {currentScreen === "dashboard" && currentUser && (
        <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold">नमस्ते, {currentUser}! 👋</h1>
            <button onClick={handleLogout} className="text-red-500 text-sm font-bold border border-red-200 px-3 py-1 rounded">Logout</button>
          </div>

          <div className="flex gap-2 mb-4">
            <input 
              className="w-full border p-2 rounded" 
              placeholder="आज क्या करना है?" 
              value={todoInput} 
              onChange={(e) => setTodoInput(e.target.value)} 
            />
            <button onClick={handleAddTodo} className="bg-blue-600 text-white px-4 rounded">Add</button>
          </div>

          <div className="bg-gray-50 p-4 rounded min-h-[150px]">
            <h3 className="font-bold mb-2 border-b pb-1">आपके नोट्स:</h3>
            {userList[currentUser].data.length === 0 ? (
              <p className="text-gray-400 text-sm">अभी कुछ नहीं लिखा है...</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {userList[currentUser].data.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
