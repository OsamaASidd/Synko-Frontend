"use client";

import { useState } from "react";
import { FiMessageCircle } from "react-icons/fi";
import { MdKeyboardArrowDown } from "react-icons/md";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Box */}
      {isOpen && (
        <div className="w-[300px] rounded-2xl overflow-hidden bg-[#E2F6D9] shadow-lg mb-3 mr-3">
          <div className="bg-[#E2F6D9] text-black p-4">
            <h2 className="text-lg font-bold">Hi Afkar!</h2>
            <p className="text-sm">How can we help?</p>
          </div>

          <div className="p-4 space-y-3">
            {/* Recent message */}
            <div>
              <p className="text-xs text-gray-500">Recent message</p>
              <div className="flex items-start space-x-2 mt-1">
               
                <p className="text-sm text-black">Hello Afkar, let us know how...</p>
              </div>
            </div>

            {/* Chat with us button */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2 cursor-pointer hover:bg-gray-200 transition">
              <FiMessageCircle className="text-gray-600" />
              <p className="text-sm text-black">Chat with us</p>
            </div>

            {/* Search input */}
            <div className="flex items-center border text-[#0E6439] rounded-lg p-2">
              <input
                type="text"
                placeholder="Search for help"
                className="text-sm w-full outline-none bg-transparent text-[#0E6439]"
              />
            </div>
          </div>

          {/* Footer navigation */}
          <div className="flex justify-around p-2 text-[#0E6439] text-xs border-t">
            <div className="flex flex-col items-center">
              <span>Home</span>
            </div>
            <div className="flex flex-col items-center">
              <span>Messages</span>
            </div>
            <div className="flex flex-col items-center">
              <span>Help</span>
            </div>
          </div>
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
