"use client";
import { useState } from "react";

const SingleOrderModal = ({ isOpen2, toggleModal, contentComponent }) => {
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
            <div className="inline-block relative align-bottom bg-[white] h-[600px] overflow-y-auto rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-[40%] sm:w-full">
              <div className="absolute top-2 right-4">
                <button
                  onClick={toggleModal}
                  type="button"
                  className="w-full inline-flex justify-center rounded-md shadow-sm px-4 py-2 bg-gradient-to-r from-[#7DE143] to-[#055938] text-white font-bold text-base hover:bg-[#93ffdf] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  X
                </button>
              </div>
              <div className="bg-white px-2 sm:px-4 pb-4 sm:p-6 sm:pb-4 mt-5">
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

export default SingleOrderModal;
