"use client";

import { useState, useEffect, useRef } from "react";
import { FiMessageCircle } from "react-icons/fi";
import { MdKeyboardArrowDown } from "react-icons/md";
import axios from "axios";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("analytics");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]); // array of { role: "user" | "bot", content: string }
  const [sessionId, setSessionId] = useState(null); // For maintaining conversation context
  const messagesEndRef = useRef(null); // For auto-scrolling to bottom

  const analyticsPrompts = [
    "What's the most selling item?",
    "Who's the best performing employee?",
    "Show sales by category",
    "What are the peak sales hours?",
    "Which menu items have the highest profit margin?",
  ];

  const taskPrompts = [
    "Add Chicken Malai Roll for €6 under BBQ, available for take-away and delivery",
  ];

  useEffect(() => {
    setSessionId(generateSessionId());
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const generateSessionId = () => {
    return 'session-' + Math.random().toString(36).substring(2, 15);
  };

  const prompts = mode === "analytics" ? analyticsPrompts : taskPrompts;

  async function handleSubmit(message) {
    if (!message.trim()) return;

    setLoading(true);

    // Add user message immediately
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");

    try {
      if (mode === "analytics") {
        const res = await axios.post(
          "http://localhost:5000/api/query",
          { query: message },
          { responseType: "blob" }
        );
        const imageUrl = URL.createObjectURL(res.data);
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: `<img src="${imageUrl}" alt="Analytics Chart" />` },
        ]);
      } else if (mode === "task") {
        // Send the session ID with the request to maintain conversation context
        const res = await axios.post("http://localhost:5000/api/agent", {
          query: message,
          session_id: sessionId,
        });
        
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: res.data?.message || "Task executed successfully!" },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "bot", content: "Something went wrong." }]);
    } finally {
      setLoading(false);
    }
  }

  function handlePromptClick(prompt) {
    setInput(prompt);
    handleSubmit(prompt);
  }

  function handleKeyPress(e) {
    if (e.key === "Enter") {
      handleSubmit(input);
    }
  }

  // Clear conversation and reset session ID
  function handleModeChange(newMode) {
    setMode(newMode);
    setMessages([]);
    setSessionId(generateSessionId());
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Box */}
      {isOpen && (
        <div className="w-[340px] rounded-2xl overflow-hidden bg-[#E2F6D9] shadow-lg mb-3 mr-3 flex flex-col h-[600px]">
          <div className="bg-[#E2F6D9] text-black p-4 border-b">
            <h2 className="text-lg font-bold">Hi Afkar!</h2>
            <p className="text-sm">How can we help?</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex justify-around p-2 border-b">
            <button
              onClick={() => handleModeChange("analytics")}
              className={`text-sm px-3 py-1 rounded-full ${
                mode === "analytics" ? "bg-[#0E6439] text-white" : "bg-gray-100 text-[#0E6439]"
              } transition`}
            >
              Analytics
            </button>
            <button
              onClick={() => handleModeChange("task")}
              className={`text-sm px-3 py-1 rounded-full ${
                mode === "task" ? "bg-[#0E6439] text-white" : "bg-gray-100 text-[#0E6439]"
              } transition`}
            >
              Task Execution
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg shadow-sm text-sm ${
                  msg.role === "user"
                    ? "bg-[#0E6439] text-white self-end ml-12"
                    : "bg-white text-black mr-12"
                }`}
                dangerouslySetInnerHTML={{ __html: msg.content }}
              />
            ))}

            {loading && (
              <div className="text-sm text-gray-500 animate-pulse">Loading...</div>
            )}
            <div ref={messagesEndRef} /> {/* Empty div for scroll reference */}
          </div>

          {/* Input Box */}
          <div className="flex items-center border-t p-2 bg-white">
            <input
              type="text"
              placeholder="Type your message..."
              className="text-sm w-full outline-none text-black p-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
            />
          </div>

          {/* Prompts */}
          {messages.length === 0 && (
          <div className="p-4 space-y-2 border-t bg-[#E2F6D9] max-h-[120px] overflow-y-auto">
            {prompts.map((prompt, idx) => (
              <div
                key={idx}
                onClick={() => handlePromptClick(prompt)}
                className="bg-white p-2 rounded-lg cursor-pointer hover:bg-gray-100 text-sm text-black shadow-sm"
              >
                {prompt}
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#E2F6D9] text-[#0E6439] p-4 m-4 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
      >
        {isOpen ? <MdKeyboardArrowDown size={24} /> : <FiMessageCircle size={24} />}
      </button>
    </div>
  );
}