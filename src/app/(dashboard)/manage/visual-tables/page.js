export default function VisualTable() {
  return <></>;
}

// "use client";

// import React, { useContext, useEffect, useCallback } from "react";
// import { useState } from "react";
// import { Stage, Layer, Circle, Text, Group } from "react-konva";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   setItems,
//   updateItemPosition,
// } from "../../../../store/slices/tableSlice";
// import { GlobalContext } from "@/context";
// import generateItems from "./generateItems";
// import SideMenu from "@/components/menus/SideMenu";
// import ProtectedRoute from "@/components/protected-route";
// import { PulseLoader } from "react-spinners";
// import Modal from "@/components/modal";
// import CAlert from "@/components/common/CAlert";
// import CSpinner from "@/components/common/CSpinner";

// const ManageModal = (props) => {
//   const { merchant } = useContext(GlobalContext);
//   const {
//     modelIsOpen,
//     setIsModalOpen,
//     heading = "Modal",
//     operation = "add",
//     getDataUrl = "",
//     postDataUrl = "",
//     setIsDataUpdated,
//   } = props;

//   const [alert, setAlert] = useState({ type: "danger", message: "" });
//   const [loading, setLoading] = useState(false);

//   const initialState = {
//     number: "",
//     seating_capacity: 1,
//     status: 1,
//   };

//   const [inputs, setInputs] = useState(initialState);

//   const getData = () => {
//     setLoading(true);
//     getRequest(`/merchant/${merchant?.id}/${getDataUrl}`).then((res) => {
//       setLoading(false);
//       setInputs({
//         number: res?.data?.number,
//         seating_capacity: res?.data?.seating_capacity,
//         status: res?.data?.status,
//       });
//     });
//   };

//   const handleSubmit = (event) => {
//     setLoading(true);
//     event.preventDefault();
//     let url = "";
//     if (postDataUrl !== "") {
//       url = postDataUrl;
//     }
//     postRequest(
//       `/merchant/${merchant?.id}/${url}`,
//       inputs,
//       operation == "update" ? "put" : "post"
//     )
//       .then((res) => {
//         Swal.fire({
//           text: res.data.message,
//           icon: "success",
//         });
//         event.target.reset();
//         setInputs(operation == "update" ? res.data.data : initialState);
//         setIsDataUpdated(true);
//         setIsModalOpen(false);
//       })
//       .catch((err) => getErrorMessageFromResponse(err))
//       .finally(() => {
//         setLoading(false);
//       });
//   };

//   useEffect(() => {
//     if (operation == "update" && getDataUrl !== "") {
//       getData();
//     } else {
//       setInputs(initialState);
//     }
//   }, [operation, getDataUrl]);

//   const handleInputs = (event) => {
//     setInputs((prev) => ({
//       ...prev,
//       [event.target.name]: event.target.value,
//     }));
//   };

//   return (
//     <>
//       <Modal
//         isOpen={modelIsOpen}
//         heading={heading}
//         onClose={() => {
//           setInputs(initialState);
//           setIsModalOpen(false);
//           setAlert({ type: "danger", message: "" });
//         }}
//       >
//         {alert.message && <CAlert color={alert.type}>{alert.message}</CAlert>}
//         <form onSubmit={handleSubmit}>
//           <div className="w-[100%] text-[14px] text-black">
//             <div className="flex flex-col space-y-1">
//               <span>Zone Name</span>
//               <input
//                 type="name"
//                 name="number"
//                 step={1}
//                 min={0}
//                 className="w-[100%] border-2 p-2 rounded-md outline-none"
//                 required
//                 value={inputs?.number}
//                 onChange={handleInputs}
//                 placeholder="Enter Zone Name"
//               />
//             </div>

//             <div className="flex flex-col space-y-1">
//               <span>Select Table</span>
//               <input
//                 type="number"
//                 name="seating_capacity"
//                 step={1}
//                 min={0}
//                 className="w-[100%] border-2 p-2 rounded-md outline-none"
//                 required
//                 value={inputs?.seating_capacity ?? ""}
//                 onChange={handleInputs}
//                 placeholder="Enter Seating Capacity"
//               />
//             </div>

//             <div className="flex flex-col py-3 space-y-1">
//               <span>Select Visibility Status*</span>
//               <select
//                 name="status"
//                 onChange={handleInputs}
//                 placeholder="Select Status"
//                 className="h-[40px] border-2 rounded-md px-[8px]"
//                 required
//                 value={inputs?.status}
//               >
//                 <option value={1}>Active</option>
//                 <option value={2}>Disable</option>
//               </select>
//             </div>

//             <div className="flex justify-center space-x-4 w-[100%]">
//               <button
//                 type="submit"
//                 className="w-[70px] px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
//                 disabled={loading == true ? loading : loading}
//               >
//                 {loading == true ? <CSpinner /> : "Save"}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setIsModalOpen(false);
//                 }}
//                 className="border border-black w-[70px] px-3 py-2 rounded-[8px]"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </form>
//       </Modal>
//     </>
//   );
// };

// export default function VisualTables() {
//   const { pageLevelLoader, setPageLevelLoader, user, merchant } =
//     useContext(GlobalContext);
//   const dispatch = useDispatch();
//   const items = useSelector((state) => state.items.items);
//   const [isEditing, setIsEditing] = useState(false);
//   const [zoneOptions, setZoneOptions] = useState(false);
//   const [stageSize, setStageSize] = useState({
//     width: 0,
//     height: 0,
//   });
//   const [modelIsOpen, setIsModalOpen] = useState(false);
//   const [currentModalData, setCurrentModalData] = useState(null);

//   useEffect(() => {
//     setStageSize({
//       width: window.innerWidth,
//       height: window.innerHeight,
//     });
//     setPageLevelLoader(false);
//   }, []);

//   const zonelist = ["Zone-1", "Zone-2", "Zone-3", "Zone-4"];

//   useEffect(() => {
//     // dispatch(setItems(generateItems()));
//     // const handleResize = () => {
//     //   setStageSize({
//     //     width: window.innerWidth,
//     //     height: window.innerHeight,
//     //   });
//     // };
//     // window.addEventListener("resize", handleResize);
//     // return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const handleDragStart = useCallback(
//     (e) => {
//       const id = e.target.name();
//       const currentItems = items;
//       const itemsCopy = [...currentItems];
//       const item = itemsCopy.find((i) => i.id === id);
//       if (!item) return;
//       const index = itemsCopy.indexOf(item);
//       itemsCopy.splice(index, 1);
//       itemsCopy.push(item);
//       dispatch(setItems(itemsCopy));
//     },
//     [dispatch, items]
//   );
//   const handleDragEnd = useCallback(
//     (e) => {
//       if (!isEditing) return;
//       const id = e.target.name();
//       dispatch(
//         updateItemPosition({
//           id,
//           x: e.target.x(),
//           y: e.target.y(),
//         })
//       );
//     },
//     [isEditing, dispatch]
//   );

//   const toggleEditMode = () => setIsEditing(!isEditing);
//   const toggleZoneOptions = () => setZoneOptions(!zoneOptions);

//   const handleModal = (data) => {
//     setIsModalOpen(true);
//     setCurrentModalData(data);
//   };

//   if (pageLevelLoader) {
//     return (
//       <div className="w-full min-h-screen flex justify-center items-center">
//         <PulseLoader
//           color="white"
//           loading={pageLevelLoader}
//           size={30}
//           data-testid="loader"
//         />
//       </div>
//     );
//   }

//   return (
//     <ProtectedRoute pageName="visual-tables">
//       <div className="min-h-screen flex bg-[#171821] gap-x-[18px]">
//         <SideMenu />
//         {modelIsOpen == true && (
//           <ManageModal
//             modelIsOpen={modelIsOpen}
//             setIsModalOpen={setIsModalOpen}
//             heading={currentModalData?.heading}
//             operation={currentModalData?.operation}
//             getDataUrl={currentModalData?.getDataUrl}
//             postDataUrl={currentModalData?.postDataUrl}
//             // setIsDataUpdated={setIsDataUpdated}
//           />
//         )}

//         <div className="w-[100%] xl:ml-0 xl:w-[80%] px-5 py-6 h-screen overflow-auto text-black bg-[#171821]">
//           <div className="w-[100%] min-h-full bg-[#F8F8F8] rounded-[20px] py-10 lg:p-10 px-3 md:px-8 lg:pr-16">
//             <div className="w-[100%] border-b-2 text-[24px] py">
//               Visually Manage Tables
//             </div>
//             <div className="w-[100%] flex justify-end py-5 items-center">
//               <button
//                 onClick={() => {
//                   handleModal({
//                     heading: "Add a zone",
//                     operation: "add",
//                     getDataUrl: "",
//                     postDataUrl: "table",
//                   });
//                 }}
//                 id="shadow"
//                 className="bg-white px-4 mr-2 py-2 text-[14px] rounded-[10px] flex space-x-3"
//               >
//                 {/* <img src="/images/Vector.png" /> */}
//                 <p>Create Zone</p>
//               </button>

//               <div class="relative inline-block text-left mr-2">
//                 <div>
//                   <button
//                     onClick={toggleZoneOptions}
//                     type="button"
//                     class="bg-white px-4 mr-2 py-2 text-[14px] rounded-[10px] flex space-x-3  w-full justify-center gap-x-1.5 text-sm shadow-sm  ring-inset ring-gray-300 hover:bg-gray-50"
//                     id="menu-button"
//                     aria-expanded="true"
//                     aria-haspopup="true"
//                   >
//                     Select Zone
//                     <svg
//                       class="-mr-1 h-5 w-5 text-gray-400"
//                       viewBox="0 0 20 20"
//                       fill="currentColor"
//                       aria-hidden="true"
//                     >
//                       <path
//                         fill-rule="evenodd"
//                         d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
//                         clip-rule="evenodd"
//                       />
//                     </svg>
//                   </button>
//                 </div>

//                 {zoneOptions && (
//                   <div
//                     class="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
//                     role="menu"
//                     aria-orientation="vertical"
//                     aria-labelledby="menu-button"
//                     tabindex="-1"
//                   >
//                     {zonelist.map((zone, index) => (
//                       <div key={index} class="py-1" role="none">
//                         <a
//                           class="block px-4 py-2 text-sm text-gray-700"
//                           role="menuitem"
//                           tabindex="-1"
//                           id="menu-item-1"
//                         >
//                           {zone}
//                         </a>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <button
//                 onClick={toggleEditMode}
//                 id="shadow"
//                 className="bg-white px-4 py-2 text-[14px] rounded-[10px] flex space-x-3"
//               >
//                 <img src="/images/Vector.png" />
//                 <p>{!isEditing ? "Edit" : "save"}</p>
//               </button>
//             </div>
//             <div className="relative rounded-lg bg-[#2f353e] overflow-x-auto min-h-screen h-full overflow-y-hidden">
//               <Stage width={1100} height={stageSize.height}>
//                 <Layer>
//                   {items.map((item) => (
//                     <React.Fragment key={item.id}>
//                       <Group
//                         key={item.id}
//                         name={item.id}
//                         draggable={isEditing}
//                         x={item.x}
//                         y={item.y}
//                         onDragStart={handleDragStart}
//                         onDragEnd={handleDragEnd}
//                       >
//                         <Circle shadowBlur={10} fill="gray" radius={50} />
//                         <Text
//                           text={item.id}
//                           fontSize={20}
//                           fill="white"
//                           x={-30}
//                           y={-10}
//                         />
//                       </Group>
//                     </React.Fragment>
//                   ))}
//                 </Layer>
//               </Stage>
//             </div>
//           </div>
//         </div>
//       </div>
//     </ProtectedRoute>
//   );
// }
