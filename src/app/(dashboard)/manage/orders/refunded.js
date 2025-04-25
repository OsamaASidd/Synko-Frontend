"use client";
import { useState } from "react";

const Refunded = ({
  isOpen2,
  toggleModal,
  contentComponent,
  setIsOpenRefunded,
}) => {
  return (
    <>
      {/* Modal */}
      {isOpen2 && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-2 sm:px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block relative align-bottom bg-[white] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-[40%] sm:w-full">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <div className="text-[20px] font-semibold">Refund</div>
                <button
                  onClick={() => setIsOpenRefunded(null)}
                  type="button"
                  className="w-fit inline-flex justify-center rounded-md shadow-sm px-4 py-2 bg-gradient-to-r from-[#7DE143] to-[#055938] text-white font-bold text-base hover:bg-[#93ffdf] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  X
                </button>
              </div>
              <div className="bg-white px-4 py-3">
                {/* Modal content */}
                {contentComponent}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Refunded;
