export default function InputsInfoBox({ title, children, className }) {
  return (
    <div
      className={` ${className} bg-[white] pt-[25px] !pb-[15px] md:!pb-[40px] px-2 rounded-[15px] sm:rounded-[21.16px] w-full`}
    >
      <h6 className="border-b-[1.41px] border-[#D8D8D8] text-[14px] sm:text-[16px] font-[400] pb-[8px] mb-[15px]">
        {title}
      </h6>
      <div className="text-[14px] sm:text-[16px]">{children}</div>
    </div>
  );
}
