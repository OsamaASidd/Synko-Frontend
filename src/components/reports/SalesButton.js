"use client";
export default function SalesButton(props) {
  const { title, onClick } = props;

  return (
    <button
      onClick={onClick}
      className="px-3 mt-3 bg-[white] py-5 outline-none rounded-lg shadow-lg w-[100%] min-h-[100px] text-[16px] font-[500]"
    >
      {title ?? "-"}
    </button>
  );
}
