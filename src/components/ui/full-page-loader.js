import CSpinner from "../common/CSpinner";

export default function FullPageLoader() {
  return (
    <>
      <div className="h-screen w-full flex justify-center items-center">
        <CSpinner color="text-black !w-[50px] !h-[50px]" />
      </div>
    </>
  );
}
