"use client";
import { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import Select from "react-select";
import CSpinner from "@/components/common/CSpinner";
import { postRequest } from "@/utils/apiFunctions";
import useHandleInputs from "@/hooks/useHandleInputs";
import { GlobalContext } from "@/context";
import Modal from "../modal";
import { useGoogleMapsScript } from "@/hooks/useGoogleMapScript";
import { PHONE_CODE } from "../contants/phone-code";
import InputField from "../common/input-field";

export default function CreateCustomerModal({
  modalIsOpen,
  setIsModalOpen,
  heading = "Create Customer",
  operation = "add",
  getDataUrl = "",
  postDataUrl = "",
  setIsDataUpdated,
  data,
  setCustomer,
  updateData = null,
  setCurrentModalData = () => {},
  setSelectedCustomer = () => {},
}) {
  const { merchant, user, socket } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [inputs, handleInputs, setInputs] = useHandleInputs({
    email: "",
    fullname: /^[0-9]+$/.test(data) ? "" : data,
    phone_code: "+353",
    phone: /^[0-9]+$/.test(data) ? data : "",
    address: "",
    home_apartment_address: "",
    city: "",
    postal_code: "",
  });
  const [errors, setErrors] = useState({});
  const handleError = (text, input) => {
    setErrors((prev) => ({
      ...prev,
      [input]: text,
    }));
  };

  useEffect(() => {
    if (updateData?.id) {
      const data = updateData;
      setInputs({
        email: data?.email || null,
        fullname: data?.fullname || null,
        phone_code: data?.address || null,
        phone: data?.phone,
        address: data?.address || null,
        home_apartment_address: data?.home_apartment_address || null,
        city: data?.city,
        postal_code: data?.postal_code,
      });
      setSelectedPlace({ label: data?.address });
    }
  }, [updateData]);

  /* Google API Start */
  const [placeInput, setPlaceInput] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const scriptLoaded = useGoogleMapsScript();
  useEffect(() => {
    if (scriptLoaded && placeInput !== null && typeof google !== "undefined") {
      const autocompleteService = new google.maps.places.AutocompleteService();
      if (placeInput === "") {
        setPlaces([]);
        return;
      }
      autocompleteService.getPlacePredictions(
        { input: placeInput },
        (predictions, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setPlaces(
              predictions.map((prediction) => ({
                value: prediction.place_id,
                label: prediction.description,
              }))
            );
          } else {
            setPlaces([]);
          }
        }
      );
    }
  }, [placeInput, scriptLoaded]);
  const handlePlaceChange = (selectedOption) => {
    setSelectedPlace(selectedOption);
    setInputs({ address: selectedOption.label });
  };
  /* Google API End */

  const handleRequest = (e) => {
    e.preventDefault();
    let url = operation == "add" ? `` : `${updateData?.id}`;
    postRequest(
      `/merchant/${merchant?.id}/customer/${url}`,
      inputs,
      operation == "add" ? "post" : "put"
    )
      .then((res) => {
        const { data } = res.data;
        Swal.fire({
          icon: "success",
          text: "Customer Updated!!",
        });
        if (operation == "add") {
          setSelectedCustomer({ value: data?.id, label: data?.fullname });
          setCustomer({ id: data?.id, fullname: data?.fullname });
          setCurrentModalData(null);
        } else {
          setIsDataUpdated(true);
        }
        setIsModalOpen(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    let isValid = true;

    if (!inputs.fullname) {
      handleError("Name field required!", "fullname");
      isValid = false;
    }

    // if (!inputs.phone_code) {
    //   handleError("Phone code field required!", "phone_code");
    //   isValid = false;
    // }

    // if (!inputs.phone) {
    //   handleError("Phone no field required!", "phone");
    //   isValid = false;
    // }

    // if (!inputs.address || !inputs.home_apartment_address) {
    //   Swal.fire({
    //     icon: "error",
    //     text: "Billing address fields are required!",
    //   });
    //   setLoading(false);
    //   return;
    // }

    if (isValid == true) {
      handleRequest(e);
    }
  };
  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        heading={heading}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentModalData(null);
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-[10px] mt-[10px]">
            <InputField
              label={"Name"}
              name={"fullname"}
              onChange={handleInputs}
              onFocus={() => handleError(null, "fullname")}
              error={errors?.fullname}
              type={"text"}
              required={true}
              placeholder={"Enter your name"}
              value={inputs.fullname}
            />
            <InputField
              label={"Email"}
              type={"email"}
              placeholder={"Enter your email"}
              name={"email"}
              onChange={handleInputs}
              onFocus={() => handleError(null, "email")}
              error={errors?.email}
              required={false}
              value={inputs?.email}
            />

            <InputField
              isSelectInput
              label={"Phone Code"}
              type={"text"}
              required={false}
              placeholder={"Phone Code"}
              selectedDefaultValue={inputs.phone_code}
              selectOptions={PHONE_CODE.map((item, index) => (
                <option key={index} value={item.dialCode}>
                  {item.name} {item.dialCode}
                </option>
              ))}
              name={"phone_code"}
              onChange={handleInputs}
              onFocus={() => handleError(null, "phone_code")}
              error={errors?.phone_code}
            />
            <InputField
              label={"Phone No"}
              type={"number"}
              placeholder={"123 4567 7890 "}
              className={"w-full"}
              name={"phone"}
              onChange={handleInputs}
              onFocus={() => handleError(null, "phone")}
              error={errors?.phone}
              value={inputs?.phone}
            />
          </div>
          <div className="grid grid-cols-1 gap-[10px] mt-[10px]">
            <div>
              <h6 className="w-full text-[14px] font-[400] mb-[8px]">
                Full Address/Eircode/Postal Code
                <span className="text-[#F30000]">*</span>
              </h6>
              <Select
                value={selectedPlace}
                onInputChange={setPlaceInput}
                onChange={handlePlaceChange}
                options={places}
                placeholder="Search Location"
              />
            </div>
            <InputField
              label={"Street Address"}
              type={"text"}
              required={false}
              placeholder={"Home/apartment address"}
              className={"w-full"}
              name={"home_apartment_address"}
              onChange={handleInputs}
              onFocus={() => handleError(null, "home_apartment_address")}
              error={errors?.home_apartment_address}
              value={inputs?.home_apartment_address}
            />
            <InputField
              label={"Apt, suite, etc. (optional)"}
              type={"text"}
              placeholder={"Apt, suite, etc. (optional)"}
              className={"w-full"}
              name={"apt_suit_etc"}
              onChange={handleInputs}
              onFocus={() => handleError(null, "apt_suit_etc")}
              error={errors?.home_apartment_address}
            />
            <InputField
              label={"City"}
              type={"text"}
              required={false}
              placeholder={"City"}
              className={"w-full"}
              name={"city"}
              onChange={handleInputs}
              onFocus={() => handleError(null, "city")}
              error={errors?.city}
              value={inputs?.city}
            />
            <InputField
              label={"Eir code"}
              type={"text"}
              required={false}
              placeholder={"eir Code"}
              className={"w-full"}
              name={"postal_code"}
              onChange={handleInputs}
              onFocus={() => handleError(null, "postal_code")}
              error={errors?.postal_code}
              value={inputs?.postal_code}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white my-[10px]"
          >
            {loading == true ? <CSpinner color={"black"} /> : "Save"}
          </button>
        </form>
      </Modal>
    </>
  );
}
