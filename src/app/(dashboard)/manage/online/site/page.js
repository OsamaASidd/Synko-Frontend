"use client";
import React, { useContext, useEffect } from "react";
import { useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { GlobalContext } from "@/context";
import SideMenu from "@/components/menus/SideMenu";
import { getRequest, postRequest } from "@/utils/apiFunctions";
import { PulseLoader } from "react-spinners";
import Modal from "@/components/modal";
import CSpinner from "@/components/common/CSpinner";
import CAlert from "@/components/common/CAlert";
import { getErrorMessageFromResponse } from "@/utils/helper";
import Swal from "sweetalert2";
import InputsInfoBox from "@/components/ui/inputs-info-box";
import InputField from "@/components/common/input-field";
import Button from "@/components/ui/button";
import FullPageLoader from "@/components/ui/full-page-loader";
import useHandleInputs from "@/hooks/useHandleInputs";
import ProtectedRoute from "@/components/protected-route";
import { GetCountries, GetState, GetCity } from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import { storeURL } from "@/utils/api";
import { online_payment_sources } from "@/utils/constants";
import { irelandCities } from "@/utils/irelandCitiesRecord";
import Select from "react-select";
import { useGoogleMapsScript } from "@/hooks/useGoogleMapScript";
import StripeConnect from "@/components/stripe/stripe-connect";

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    border: "1px solid black",
    padding: window.innerWidth <= 640 ? "0.3rem" : "0.75rem",
    borderRadius: "0.375rem", // Matches rounded class
    boxShadow: state.isFocused ? "0 0 0 2px #000" : "none", // Focus outline
    width: "100%", // Matches w-full
    maxWidth: "100%", // Matches sm:w-[80%]
    margin: "0 auto", // Center alignment
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#9CA3AF", // Matches default Tailwind placeholder color
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#000", // Text color for selected value
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 10, // Ensure dropdown overlaps other content
  }),
};
export default function OnlineSite() {
  const { pageLevelLoader, setPageLevelLoader, user, merchant } =
    useContext(GlobalContext);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDataUpdated, setIsDataUpdated] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [inputs, handleInputs, setInputs] = useHandleInputs({
    name: "",
    public_key: "",
    secret_key: "",
    payment_source: "",
  });
  const [countryList, setcountryList] = useState([]);
  const [stateList, setstateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [siteStatus, setSiteStatus] = useState("active");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [placeInput, setPlaceInput] = useState(null);
  const [Address, setAddress] = useState();
  const [places, setPlaces] = useState([]);
  const [modelIsOpen, setIsModalOpen] = useState(false);

  const getDeliveryCharges = () => {
    getRequest(`/merchant/${merchant?.id}/delivery-charges`).then((res) => {
      setDeliveryCharges(res?.data?.charges);
    });
  };

  const [locationValue, setLocationValue] = useState({
    country: "",
    state: "",
    city: "",
    zipcode: "",
    range: "",
    address: Address,
  });
  const [locationsValueData, setLocationValueData] = useState({
    country: "",
    state: "",
    city: "",
    zipcode: "",
    range: "",
    address: Address,
  });

  const handleChangeIpnutSetLocation = (e, type) => {
    const { name, value } = e.target;
    let realValue = value;
    if (type == "select") {
      realValue = value?.split("-");
      realValue = realValue[1];
    }
    setLocationValue({
      ...locationValue,
      [name]: value,
    });
    setLocationValueData({
      ...locationsValueData,
      [name]: realValue,
    });
  };

  useEffect(() => {
    if (locationValue?.country != "") {
      GetState(parseInt(locationValue?.country)).then((data) => {
        setstateList(data);
      });
    }
    if (locationValue?.state != "") {
      let stateID = locationValue?.state?.split("-")[0];
      let countryID = locationValue?.country?.split("-")[0];
      if (countryID == "105") {
        const citiesArray = irelandCities.filter(
          (filter) => filter.id == stateID
        );
        setCityList(citiesArray[0]?.cities);
      } else {
        GetCity(parseInt(countryID), parseInt(stateID)).then((result) => {
          setCityList(result);
        });
      }
    }
  }, [locationValue]);

  const handleLocationData = async () => {
    console.log("handle location data");
    GetCountries().then((data) => {
      setcountryList(data);
    });
  };

  const get_storeLcoationData = () => {
    getRequest(`/merchant/${merchant?.id}/get_store_location`).then((res) => {
      if (res?.status == 200) {
        console.log("res.data are ", res.data);
        setLocationValueData({
          country: res?.data?.country,
          state: res?.data?.state,
          city: res?.data?.city,
          zipcode: res?.data?.zipcode,
          range: res?.data?.range,
          address: res?.data?.address,
        });
        GetCountries().then((data) => {
          let currentCountry = data.find(
            (item) => item.name == res?.data?.country
          );
          GetState(currentCountry?.id).then((data2) => {
            let currentSate = data2?.find(
              (item) => item.name == res?.data?.state
            );

            GetCity(currentCountry?.id, currentSate?.id).then((data3) => {
              let currentCity = data3?.find(
                (item) => item.name == res?.data?.city
              );
              setLocationValue({
                city: `${currentCity?.id}-${currentCity?.name}`,
                country: `${currentCountry?.id}-${currentCountry?.name}`,
                state: `${currentSate?.id}-${currentSate?.name}`,
              });
            });
          });
        });
      }
    });
  };

  useEffect(() => {
    if (merchant?.id) {
      getDeliveryCharges();
      handleLocationData();
      get_storeLcoationData();
    }
  }, [merchant?.id]);

  const getData = () => {
    setPageLevelLoader(true);
    getRequest(`/merchant/${merchant?.id}/site`).then((res) => {
      setPageLevelLoader(false);
      setData(res?.data);
      setInputs({
        name: res?.data?.name,
        public_key: res?.data?.site_payment?.public_key,
        secret_key: res?.data?.site_payment?.secret_key,
        payment_source: res?.data?.site_payment?.type,
      });
      setIsDataUpdated(false);
    });
  };

  useEffect(() => {
    if (isDataUpdated == true) {
      getData();
    }
  }, [isDataUpdated]);

  useEffect(() => {
    if (merchant.id !== undefined && user) getData();
  }, [user, merchant]);

  const validate = (e) => {
    e.preventDefault();

    setLoading(true);
    let isValid = true;

    if (!inputs.name) {
      handleError("Name field required!", "name");
      isValid = false;
    }

    if (!inputs.payment_source) {
      Swal.fire({ text: "Payment source field is required", icon: "warning" });
      isValid = false;
    }

    if (inputs?.payment_source == online_payment_sources.stripe) {
      if (!inputs.public_key) {
        handleError("Public key field required!", "public_key");
        isValid = false;
      }

      if (!inputs.secret_key) {
        handleError("secret key field required!", "secret_key");
        isValid = false;
      }
    }

    if (isValid) {
      handleData();
    } else {
      setLoading(false);
    }
  };
  const [errors, setErrors] = useState({});
  const handleError = (text, input) => {
    setErrors((prev) => ({
      ...prev,
      [input]: text,
    }));
  };
  const handleData = () => {
    postRequest(`/merchant/${merchant?.id}/site`, inputs)
      .then((res) => {
        Swal.fire({
          text: res.data.message,
          icon: "success",
        });
        setIsDataUpdated(true);
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setLoading(false);
      });
  };

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
    // Use the Place Details API to fetch detailed address components
    const placeService = new google.maps.places.PlacesService(
      document.createElement("div")
    );

    placeService.getDetails(
      { placeId: selectedOption.value },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const components = place.address_components || [];
          const extractedDetails = {
            country:
              components.find((comp) => comp.types.includes("country"))
                ?.long_name || null,
            state:
              components.find((comp) =>
                comp.types.includes("administrative_area_level_1")
              )?.long_name || null,
            city:
              components.find((comp) => comp.types.includes("locality"))
                ?.long_name || null,
            postal_code:
              components.find((comp) => comp.types.includes("postal_code"))
                ?.long_name || null,
            street:
              components.find((comp) => comp.types.includes("route"))
                ?.long_name || null,
            street_number:
              components.find((comp) => comp.types.includes("street_number"))
                ?.long_name || null,
          };

          // Fallback to reverse geocoding if postal_code is missing
          if (!extractedDetails.postal_code && place.geometry?.location) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode(
              { location: place.geometry.location },
              (results, status) => {
                if (status === "OK" && results.length > 0) {
                  const addressComponents = results[0].address_components;
                  const postalCode = addressComponents.find((comp) =>
                    comp.types.includes("postal_code")
                  )?.long_name;

                  // Check for Eircode specifically
                  const eircode = addressComponents.find((comp) =>
                    comp.types.includes("postal_code")
                  )?.long_name;

                  console.log(
                    "Reverse Geocode Postal Code:",
                    postalCode || eircode
                  );

                  extractedDetails.postal_code = postalCode || eircode || null;
                } else {
                  console.error("Reverse Geocoding failed:", status);
                }
              }
            );
          }
          // setExtractedDetails(extractedDetails);
          console.log("Extracted Details:", extractedDetails);
        } else {
          console.error("Place details retrieval failed:", status);
        }
      }
    );

    setSelectedPlace(selectedOption);
    setAddress(selectedOption.label);
    setLocationValueData({ ...locationValue, address: selectedOption.label });
    // setInputs({ delivery_address: selectedOption.label });
  };

  if (pageLevelLoader) {
    return <FullPageLoader />;
  }

  let selected_url = storeURL;

  const iframeCode = `<iframe src="${selected_url}/${data?.site_key}"></iframe>`;
  const URLCode = `${selected_url}/${data?.site_key}`;

  const CopyLink = ({ link }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      if ("clipboard" in navigator) {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Message disappears after 2s
      } else {
        console.error("Clipboard not available");
      }
    };

    return (
      <div className="flex p-4 w-full">
        <div className="flex items-center justify-between bg-gray-800 text-white rounded-md w-full">
          <input
            type="text"
            value={link}
            readOnly
            className="bg-transparent w-full p-2 text-sm focus:outline-none"
            onClick={handleCopy} // Copy when the input is clicked
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-2 text-sm rounded-md ${
              copied ? "bg-green-500" : "bg-blue-500"
            }`}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    );
  };

  const handleDeliverycharges = () => {
    postRequest(`/merchant/${merchant?.id}/delivery-charges`, {
      charges: deliveryCharges || 0,
    })
      .then((res) => {
        Swal.fire({
          text: res.data.message,
          icon: "success",
        });
        setIsDataUpdated(true);
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setLoading(false);
      });
  };
  const updateSiteStatus = () => {
    postRequest(`/status/${merchant?.id}/${data?.id}`, {
      status: siteStatus,
    })
      .then((res) => {
        Swal.fire({
          text: res.data.message,
          icon: "success",
        });
        setIsDataUpdated(true);
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setLoading(false);
      });
  };
  const set_store_location = () => {
    postRequest(
      `/merchant/${merchant?.id}/set_store_location`,
      locationsValueData
    )
      .then((res) => {
        if (res?.status == 200) {
          Swal.fire({
            text: res.data.message,
            icon: "success",
          });
          // setIsDataUpdated(true);
          get_storeLcoationData();
        }
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setLoading(false);
      });
  };

  const submitStoreLocation = (e) => {
    e.preventDefault();
    set_store_location();
  };

  const CreateStripeAccount = () => {
    postRequest(`/stripe/${merchant?.id}/create-connected-account`)
      .then((res) => {
        // window.location.href = "/manage/StripeConnect";
        setIsModalOpen(true);
      })
      .catch((err) => getErrorMessageFromResponse(err))
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <ProtectedRoute pageName={"onlines"}>
      <div className="min-h-screen flex bg-[#171821]">
        <SideMenu />

        <div className="w-[100%] xl:ml-0 xl:w-[80%] px-5 xl:px-0 xl:pr-5 py-6 h-screen overflow-auto text-black bg-[#171821]">
          <div className="w-[100%] h-[calc(100vh-48px)] overflow-y-auto  bg-[white] rounded-[20px]  py-10 lg:p-10 px-3 md:px-8  lg:pr-16">
            <div className="w-[100%] border-b-2 text-[24px] py-2 my-5">
              Manage Site
            </div>

            <div className="sm:flex items-center justify-between">
              <div className="flex flex-col sm:flex-row sm:items-end gap-2 ml-2">
                <InputField
                  label={"Delivery Charges"}
                  placeholder={"Delivery Charges"}
                  name="name"
                  type="number"
                  value={deliveryCharges || null}
                  onChange={(e) => {
                    setDeliveryCharges(e.target.value);
                  }}
                />
                <div className="flex justify-end items-end">
                  <Button
                    onClick={handleDeliverycharges}
                    disabled={loading}
                    className={"!rounded-[10px] "}
                  >
                    {loading == true ? <CSpinner /> : "Save"}
                  </Button>
                </div>
              </div>
              <div>
                <h1 className="ml-2 py-1">Online Site Status</h1>
                <div className="flex flex-col sm:flex-row sm:items-end gap-2 ml-2">
                  <select
                    className="px-4 py-3 border outline-none rounded-lg"
                    onChange={(e) => {
                      setSiteStatus(e.target.value);
                    }}
                    defaultValue={data?.status}
                  >
                    <option value={"active"}>Active</option>
                    <option value={"inactive"}>In Active</option>
                  </select>
                  <div className="flex justify-end items-end">
                    <Button
                      onClick={updateSiteStatus}
                      disabled={loading}
                      className={"!rounded-[10px] "}
                    >
                      {loading == true ? <CSpinner /> : "Save"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <InputsInfoBox className={"mb-[30px]"} title={"Store Location"}>
              <form onSubmit={submitStoreLocation} className="">
                <div className="grid md:grid-cols-2 gap-[10px] ">
                  <div className="flex flex-col">
                    <label className="text-sm mb-[8px] sm:text-[16px]">
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      className="px-4 py-3 border outline-none rounded-lg w-full bg-white"
                      onChange={(e) => {
                        handleChangeIpnutSetLocation(e, "select");
                      }}
                      value={locationValue.country}
                    >
                      {countryList.map((item, index) => (
                        <option key={index} value={`${item?.id}-${item?.name}`}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm mb-[8px] sm:text-[16px]">
                      State
                    </label>
                    <select
                      id="state"
                      name="state"
                      className="px-4 py-3 border outline-none rounded-lg w-full bg-white"
                      onChange={(e) => {
                        handleChangeIpnutSetLocation(e, "select");
                      }}
                      value={locationValue.state}
                    >
                      {stateList.map((item, index) => (
                        <option key={index} value={`${item?.id}-${item?.name}`}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm mb-[8px] sm:text-[16px]">
                      City
                    </label>
                    <select
                      id="city"
                      name="city"
                      className="px-4 py-3 border outline-none rounded-lg w-full bg-white"
                      onChange={(e) => {
                        handleChangeIpnutSetLocation(e, "select");
                      }}
                      value={locationValue.city}
                    >
                      {cityList?.map((item, index) => (
                        <option key={index} value={`${item?.id}-${item?.name}`}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <InputField
                    name="zipcode"
                    type="text"
                    onChange={handleChangeIpnutSetLocation}
                    value={locationsValueData?.zipcode ?? null}
                    onFocus={() => handleError(null, "zip_code")}
                    placeholder={"Zip Code/EirCode/Postal Code"}
                    label={"Zip Code/EirCode/Postal Code"}
                  />
                  <InputField
                    name="range"
                    type="text"
                    onChange={handleChangeIpnutSetLocation}
                    value={locationsValueData?.range ?? null}
                    onFocus={() => handleError(null, "range")}
                    placeholder={"delivery range in kilometers"}
                    label={"Delivery Range in KM"}
                  />

                  {/* Address Input */}
                  <div>
                    <h5 className="text-sm mb-[8px] sm:text-[16px]">
                      Select new address:
                    </h5>
                    <div className="flex items-center gap-2">
                      <form
                        className="sm:flex-row flex-col flex items-center w-full gap-3"
                        // onSubmit={handleDeliverySubmit}
                      >
                        <div className="w-[80%]">
                          <Select
                            value={selectedPlace}
                            onInputChange={setPlaceInput}
                            onChange={handlePlaceChange}
                            options={places}
                            placeholder="Search Location"
                            styles={customStyles}
                            defaultInputValue={locationsValueData?.address}
                          />
                        </div>
                        {/* <button
                            type="submit"
                            className="bg-gray-300 px-4 text-white font-medium sm:py-4 py-2 w-full sm:w-[20%] bg-gradient-custom rounded text-[20px]"
                          >
                            Next
                          </button> */}
                      </form>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-start items-center">
                  <Button
                    disabled={loading}
                    type={"submit"}
                    className={"!rounded-[10px]"}
                  >
                    {loading == true ? <CSpinner /> : "Update"}
                  </Button>
                </div>
              </form>
            </InputsInfoBox>

            <InputsInfoBox className={"mb-[30px]"} title={"Site Information"}>
              <form onSubmit={validate} className="">
                <div className="grid sm:grid-cols-2 gap-[10px] ">
                  <InputField
                    name="name"
                    type="text"
                    onChange={handleInputs}
                    onFocus={() => handleError(null, "name")}
                    placeholder={"Site Title"}
                    label={"Site Title"}
                    error={errors?.name}
                    value={inputs?.name ?? null}
                  />
                  <InputField
                    placeholder={"Select Payment Source"}
                    label={"Payment Integration"}
                    onChange={handleInputs}
                    onFocus={() => handleError(null, "payment_source")}
                    name="payment_source"
                    value={inputs?.payment_source ?? null}
                    isSelectInput={true}
                    defaultSelected={inputs?.payment_source ?? null}
                    selectOptions={
                      <>
                        <option value={online_payment_sources.stripe.id}>
                          {online_payment_sources.stripe.name}
                        </option>
                        <option value={online_payment_sources.viva_direct.id}>
                          {online_payment_sources.viva_direct.name}
                        </option>
                      </>
                    }
                  />
                  {inputs?.payment_source ==
                  online_payment_sources.stripe.id ? (
                    <>
                      <InputField
                        name="public_key"
                        type="text"
                        onChange={handleInputs}
                        onFocus={() => handleError(null, "public_key")}
                        placeholder={"Enter your payment public api key"}
                        label={"Public Key"}
                        error={errors?.public_key}
                        value={inputs?.public_key ?? null}
                      />
                      <InputField
                        name="secret_key"
                        type="text"
                        onChange={handleInputs}
                        onFocus={() => handleError(null, "secret_key")}
                        placeholder={"Enter your payment secret api key"}
                        label={"Secret Key"}
                        error={errors?.secret_key}
                        value={inputs?.secret_key}
                      />
                    </>
                  ) : (
                    <></>
                  )}

                  <button
                    className="w-[100%] px-5 py-3 rounded-[8px] font-semibold bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
                    disabled={loading}
                    type={"submit"}
                  >
                    {loading == true ? <CSpinner /> : "Save"}
                  </button>
                </div>
              </form>
            </InputsInfoBox>

            <div className="w-[100%] flex justify-end">
              <button
                className="w-fit px-5 py-3 rounded-[8px] font-semibold bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
                onClick={CreateStripeAccount}
              >
                Stripe Connect
              </button>
            </div>
            {modelIsOpen === true && (
              <StripeConnect
                modelIsOpen={modelIsOpen}
                setIsModalOpen={setIsModalOpen}
              />
            )}

            {data?.site_key && (
              <>
                <InputsInfoBox className={"mb-[30px]"} title={"Store URL"}>
                  <CopyLink link={URLCode} />
                </InputsInfoBox>

                <InputsInfoBox className={"mb-[30px]"} title={"Embedded Code"}>
                  <CopyLink link={iframeCode} />
                </InputsInfoBox>
              </>
            )}
          </div>
          {/* <div className="flex justify-end items-end">
            <Button
              onClick={CreateStripeAccount}
              disabled={loading}
              className={"!rounded-[10px] "}
            >
              {loading == true ? <CSpinner /> : "Save"}
            </Button>
          </div> */}
        </div>
      </div>
    </ProtectedRoute>
  );
}
