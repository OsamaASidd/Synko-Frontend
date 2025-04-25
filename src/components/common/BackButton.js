"use client";

import { useRouter } from "next/navigation";
import { RiCloseFill } from "react-icons/ri";
export default function BackButton(props) {
  const { link, type } = props;
  const handleCrossClick = () => {
    router.push(link);
  };
  const router = useRouter();

  return (
    <>
      <div className="flex items-center">
        <h1
          onClick={handleCrossClick}
          className="text-[15px] md:text-[22px] font-light mt-6 px-4"
        >
          <RiCloseFill
            size={40}
            className={`${
              type ? "" : "text-[black]"
            } hover:text-red-700 cursor-pointer`}
          />
        </h1>
      </div>
      {type ? null : (
        <div className="h-[1px] w-[100%] bg-gray-400 mt-[20px]"></div>
      )}
    </>
  );
}
