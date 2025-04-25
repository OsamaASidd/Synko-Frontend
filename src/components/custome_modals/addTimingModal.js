"use client";

export default function Modal({
    isOpen,
    setIsOpen,
    children,
    heading,
}) {


    if (!isOpen) return null;

    return (
        <>
            <div
                className={`${!isOpen ? "hidden" : ""
                    } fixed top-0 left-0 h-screen overflow-y-auto flex items-center justify-center z-50 w-full p-4 overflow-x-hidden md:inset-0 bg-[#0000006e]`}
            >
                <div className="relative w-[90%] lg:w-[50%] sm:w-[90%] md:w-[60%]">
                    <div className="relative rounded-lg shadow bg-[white] text-[black]">
                        <div className="flex items-center justify-between p-5 border-b rounded-t border-gray-600">
                            <h3 className="text-xl font-medium">{heading ?? "Modal"}</h3>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-[#055938] bg-[#DDF1D1] hover:bg-[#055938] hover:text-[white] rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
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
    );
}
