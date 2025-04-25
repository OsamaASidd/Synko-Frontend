import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import Button from "./ui/button";

export default function Paginate({
  metaData,
  setPageCurrent,
  isLoadMore = false,
}) {
  const PAGE_GROUP_SIZE = 10; // Number of pages to display in a group

  const handlePreviousPage = () => {
    if (metaData.current_page > 1) {
      setPageCurrent(metaData.current_page - 1);
    }
  };

  const handleNextPage = () => {
    if (metaData.current_page < metaData.last_page) {
      setPageCurrent(metaData.current_page + 1);
    }
  };

  const generatePageNumbers = () => {
    const currentPage = metaData.current_page;
    const totalPages = metaData.last_page;

    const currentGroupStart =
      Math.floor((currentPage - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1;
    const currentGroupEnd = Math.min(
      currentGroupStart + PAGE_GROUP_SIZE - 1,
      totalPages
    );

    const pageNumbers = [];

    // Display the current group of pages
    for (let i = currentGroupStart; i <= currentGroupEnd; i++) {
      pageNumbers.push(
        <li key={i}>
          <button
            onClick={() => setPageCurrent(i)}
            className={`flex items-center justify-center sm:px-3 px-1 sm:text-[16px] text-[12px] sm:h-8 h-4 sm:w-8 w-4 rounded-full ${
              metaData.current_page === i ? "bg-[#2a2a2a] text-white" : ""
            }`}
          >
            {i}
          </button>
        </li>
      );
    }

    // Add ellipsis and the last page
    if (currentGroupEnd < totalPages) {
      pageNumbers.push(
        <li key="ellipsis">
          <span className="sm:px-3 px-1 sm:text-[16px] text-[12px]">...</span>
        </li>
      );

      pageNumbers.push(
        <li key={totalPages}>
          <button
            onClick={() => setPageCurrent(totalPages)}
            className={`flex items-center justify-center sm:px-3 px-1 sm:text-[16px] text-[12px] sm:h-8 h-4 sm:w-8 w-4 rounded-full ${
              metaData.current_page === totalPages
                ? "bg-[#2a2a2a] text-white"
                : ""
            }`}
          >
            {totalPages}
          </button>
        </li>
      );
    }

    return pageNumbers;
  };

  if (isLoadMore && metaData.current_page < metaData.last_page) {
    return (
      <div className="pt-7 flex items-center justify-center w-full">
        <Button onClick={handleNextPage}>Load More</Button>
      </div>
    );
  } else if (isLoadMore && metaData.current_page >= metaData.last_page) {
    return null;
  }

  return (
    <div className="flex items-center justify-center pt-7 text-[#666666] sm:space-x-8 space-x-2">
      <MdArrowBackIos
        className={`text-[20px] ${
          metaData.current_page === 1
            ? "text-gray-400"
            : "text-[#2a2a2a] cursor-pointer"
        }`}
        onClick={handlePreviousPage}
      />
      <ul className="inline-flex sm:space-x-6 space-x-2">
        {generatePageNumbers()}
      </ul>
      <MdArrowForwardIos
        className={`text-[20px] ${
          metaData.current_page === metaData.last_page
            ? "text-gray-400"
            : "text-[#2a2a2a] cursor-pointer"
        }`}
        onClick={handleNextPage}
      />
    </div>
  );
}

// import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
// import Button from "./ui/button";

// export default function Paginate({
//   metaData,
//   setPageCurrent,
//   isLoadMore = false,
// }) {
//   const pageNumbers = [];

//   for (let i = 1; i <= metaData.last_page; i++) {
//     pageNumbers.push(
//       <li key={i}>
//         <button
//           onClick={() => {
//             setPageCurrent(i);
//           }}
//           className={`flex items-center justify-center sm:px-3 px-1 sm:text-[16px] text-[12px] sm:h-8 h-4 sm:w-8 w-4 rounded-full ${
//             metaData.current_page === i ||
//             (metaData.current_page === null && i === 1)
//               ? "bg-[#2a2a2a] text-white"
//               : ""
//           }`}
//         >
//           {i}
//         </button>
//       </li>
//     );
//   }
//   const handlePreviousPage = () => {
//     if (metaData.current_page > 1) {
//       setPageCurrent(metaData.current_page - 1);
//     }
//   };

//   const handleNextPage = () => {
//     if (metaData.current_page < metaData.last_page) {
//       setPageCurrent(metaData.current_page + 1);
//     }
//   };

//   if (isLoadMore == true && metaData.current_page < metaData.last_page) {
//     return (
//       <div className="pt-7 flex items-center justify-center w-full">
//         <Button
//           onClick={() => {
//             handleNextPage();
//           }}
//         >
//           Load More
//         </Button>
//       </div>
//     );
//   } else if (
//     isLoadMore == true &&
//     metaData.current_page >= metaData.last_page
//   ) {
//     return null;
//   }

//   return (
//     <div className="flex items-center justify-center pt-7 text-[#666666] sm:space-x-8 space-x-2">
//       <MdArrowBackIos
//         className="text-[20px] text-[#2a2a2a] cursor-pointer"
//         onClick={handlePreviousPage}
//       />
//       <ul className="inline-flex sm:space-x-6 space-x-2">{pageNumbers}</ul>
//       <MdArrowForwardIos
//         className="text-[20px] text-[#2a2a2a] cursor-pointer"
//         onClick={handleNextPage}
//       />
//     </div>
//   );
// }
