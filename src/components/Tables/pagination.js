import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

const Pagination = ({
  pagination,
  perPage,
  setPerPage,
  pageNum,
  setPageNum,
}) => {
  const handleChange = (event) => {
    setPerPage(event.target.value);
  };

  return (
    <>
      <div class="align-center flex justify-center">
        <div class="flex w-[100px]">
          <button
            onClick={() => {
              if (pageNum > 1) {
                setPageNum(pageNum - 1);
              }
            }}
            class="bg-white border item-center flex w-[50%] items-center justify-center"
          >
            <IoIosArrowBack />
          </button>
          <button
            onClick={() => {
              setPageNum(pageNum + 1);
            }}
            class="bg-white border flex w-[50%] justify-center items-center"
          >
            <IoIosArrowForward />
          </button>
        </div>

        <div class="ml-4 flex justify-center items-center">
          <div>Page:</div>
          <div class="ml-2 mr-2 flex min-w-[40px] items-center justify-center bg-white border">
            {pagination?.currentPage}
          </div>
          <div>of</div>
          <div class="ml-1">{pagination?.totalPages}</div>
        </div>

        <div class="flex justify-center items-center ml-4">
          <div>Rows Per Page:</div>
          <select
            value={perPage}
            onChange={handleChange}
            class="ml-2 block appearance-none bg-white border  hover:border-gray-500 px-4 py-1 pr-8  shadow leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default Pagination;
