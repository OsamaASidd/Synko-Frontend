"use client";
import CSpinner from "@/components/common/CSpinner";
import CreateCustomerModal from "@/components/customers/CreateCustomerModal";
import { postRequest, postRequestpos } from "@/utils/apiFunctions";
import { debounce } from "@/utils/helper";
import { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
export default function CreateCustomer({
  setCustomer,
  customer,
  merchant,
  type,
  modalIsOpen,
  setIsModalOpen,
}) {
  const [loading, setLoading] = useState(false);
  const [customerInput, setCustomerInput] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustoemr, setSelectedCustomer] = useState(null);

  const [currentModalData, setCurrentModalData] = useState(null);
  console.log("first");

  const handleGetCustomer = () => {
    setLoading(true);
    postRequestpos(
      `/merchant/${merchant?.id}/search/customer?search=${customerInput}`,
      {},
      "GET"
    )
      .then((res) => {
        const data = res.data;
        setCustomers(
          data?.map((item) => ({
            value: item?.id,
            label: item?.fullname + " " + (item?.phone || ""),
          }))
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleCustomer = debounce(handleGetCustomer, 800);
  useEffect(() => {
    if (customerInput !== null) {
      handleCustomer();
    }
  }, [customerInput]);

  useEffect(() => {
    if (customer) {
      setSelectedCustomer({ value: customer?.id, label: customer?.fullname });
    } else {
      setSelectedCustomer(null);
    }
  }, [customer]);
  const handleCustomerChange = (selectedItem) => {
    console.log(selectedItem, "<------selectedItem");
    if (selectedItem) {
      setSelectedCustomer(selectedItem);
      setCustomer({ id: selectedItem?.value, fullname: selectedItem?.label });
    } else {
      setSelectedCustomer(null);
      setCustomer({});
    }
  };

  const setData = debounce(setCurrentModalData, 500);

  const handleCreate = async (value) => {
    setData({
      heading: "Add Customer",
      operation: "add",
      postDataUrl: "/",
      data: value,
    });
    setIsModalOpen(true);
  };
  return (
    <>
      {modalIsOpen === true && currentModalData !== null ? (
        <CreateCustomerModal
          type={type}
          modalIsOpen={modalIsOpen}
          setIsModalOpen={setIsModalOpen}
          heading={currentModalData?.heading}
          operation={currentModalData?.operation}
          getDataUrl={currentModalData?.getDataUrl}
          postDataUrl={currentModalData?.postDataUrl}
          data={currentModalData?.data}
          setCurrentModalData={setCurrentModalData}
          setSelectedCustomer={setSelectedCustomer}
          setCustomer={setCustomer}
        />
      ) : (
        <></>
      )}
      <CreatableSelect
        isLoading={loading}
        onInputChange={setCustomerInput}
        onChange={handleCustomerChange}
        value={selectedCustoemr}
        options={customers}
        name="customer_id"
        placeholder={
          type == true ? "Customer Name" : "Customer (Name / Phone #)"
        }
        className="react-select-container" // You can customize the class for styling
        classNamePrefix="react-select" // Prefix for inner classes
        isClearable
        loadingMessage={() => <CSpinner color={"!text-black"} />}
        onCreateOption={handleCreate}
      />
    </>
  );
}
