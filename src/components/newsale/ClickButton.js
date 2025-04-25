"use client";
export default function ClickButton(props) {
  const { name, classes, children } = props;

  return (
    <div
      {...props}
      className={`${
        classes ?? ""
      } cursor-pointer flex items-center p-3 text-base font-bold text-center rounded-lg group hover:shadow bg-gradient-to-r from-[#7DE143] to-[#055938] text-white`}
    >
      <span className="flex-1 whitespace-nowrap">
        {children ?? name ?? ""}{" "}
      </span>
    </div>
  );
}
