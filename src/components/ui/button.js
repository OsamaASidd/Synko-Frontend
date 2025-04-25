export default function Button({
  onClick,
  className,
  children,
  type,
  ...props
}) {
  return (
    <button
      onClick={onClick}
      type={type}
      className={`${className} bg-[#fff] border-2 border-[#055938] text-[#000] py-[10px] px-[30px] rounded-full button-shadow`}
      {...props}
    >
      {children}
    </button>
  );
}
