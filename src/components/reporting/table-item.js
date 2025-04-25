export default function TableItem({
  isHeading = false,
  isMainItem = false,
  isFirstItem = false,
  isLastItem = false,
  heading = "",
  content = "",
  isIndent = false,
  moreIndent = false,
  className,
  onClick = null,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      {...props}
      className={` ${className || ""} ${
        isFirstItem == true &&
        "border-y border-t-[#e9e9e9] border-b-[#b3b3b3] mt-[25px]"
      } ${
        isLastItem == false &&
        isFirstItem == false &&
        "border-b border-b-[#e9e9e9]"
      } ${
        isLastItem == true && "border-b border-b-[#b3b3b3] mb-[30px]"
      } py-[10px] flex justify-between w-full ${
        onClick !== null ? "cursor-pointer" : ""
      }`}
    >
      <h2
        className={`${isHeading == true && "font-[500]"} 
        ${isMainItem == true && "font-[500] text-[14px]"}
        ${
          isHeading == false && isMainItem == false && "font-[300] text-[14px]"
        } ${isIndent == true && "indent-[20px] font-[300] text-[14px]"} ${
          moreIndent == true && isIndent == true ? "!indent-[40px]" : ""
        }`}
      >
        {heading}
      </h2>
      <h5 className={`text-[14px] ${isMainItem == true && "font-[500]"}`}>
        {content}
      </h5>
    </div>
  );
}
