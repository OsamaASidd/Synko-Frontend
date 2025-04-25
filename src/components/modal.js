"use client";

export default function Modal({
  modalId,
  isOpen,
  onClose,
  children,
  heading,
  info,
  type,
}) {
  if (!isOpen) return null;

  return (
    <>
      {!type ? (
        <>
          <div
            className={` ${
              !isOpen ? "hidden" : ""
            } fixed justify-center items-center flex top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto inset-0 max-h-full h-[100%] bg-[#0000006e]`}
          >
            <div className="relative w-full max-w-md max-h-full">
              <div className="relative rounded-lg shadow bg-white">
                <button
                  type="button"
                  onClick={() => onClose(modalId)}
                  className="absolute top-3 right-2.5 text-[#055938] bg-transparent hover:bg-[#DDF1D1] rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
                  data-modal-hide="crypto-modal"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>

                <div className="px-6 py-4 border-b rounded-t dark:border-gray-600">
                  <h3 className="text-base font-semibold text-gray-900 lg:text-xl">
                    {heading ?? "Modal"}
                  </h3>
                </div>

                <div className="py-[20px]">
                  <div className={`px-6 max-h-[400px] overflow-y-auto`}>
                    {info && (
                      <>
                        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          {info}
                        </p>
                      </>
                    )}
                    <div className="my-4 space-y-3">{children}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            className={`${
              !isOpen ? "hidden" : ""
            } fixed flex items-center justify-center z-50 w-full p-4 overflow-x-hidden inset-0 bg-[#0000006e]`}
          >
            <div className="relative w-full max-w-7xl max-h-full">
              <div className="relative rounded-lg shadow bg-[white] text-[black]">
                <div className="flex items-center justify-between p-5 border-b rounded-t border-gray-600">
                  <h3 className="text-xl font-medium">{heading ?? "Modal"}</h3>
                  <button
                    type="button"
                    onClick={() => onClose(modalId)}
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    data-modal-hide="extralarge-modal"
                  >
                    <svg
                      className="w-3 h-3"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                </div>
                <div className="space-y-6 h-[100%] max-h-[600px] overflow-y-auto">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
