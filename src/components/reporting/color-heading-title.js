export default function ColorHeadingTitle({
  title,
  value,
  color,
  onClick = () => {},
  isClickable = false,
}) {
  return (
    <div
      onClick={onClick}
      className={` ${
        isClickable == true ? "cursor-pointer" : ""
      } flex justify-between items-center mt-[10px]`}
    >
      <div className="flex gap-3 md:gap-5 items-center">
        <div
          className={`rounded-full w-[10px] md:w-[13px] h-[10px] md:h-[13px] ${
            color || null
          }`}
        ></div>
        <p className=" md:text-[16px]">{title}</p>
      </div>
      <div>
        <p className="text-[black]  md:text-[14px] font-[500]">{value}</p>
      </div>
    </div>
  );
}
