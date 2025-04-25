"use client";
import { GlobalContext } from "@/context";
import { useContext, useState } from "react";
import { postRequest } from "@/utils/apiFunctions";
import CSpinner from "@/components/common/CSpinner";
import Swal from "sweetalert2";
import { todayDate } from "@/utils/Dates";
const Form = ({ params }) => {
  const { merchant, user } = useContext(GlobalContext);
  const dataTest = useContext(GlobalContext);

  let dateNow = todayDate();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const [dateFrom, setDateFrom] = useState("");
  const [start_from, setstart_from] = useState();
  const [dateTo, setDateTo] = useState("");
  const [start_time, setstart_time] = useState(dateNow);
  const [end_time, setend_time] = useState("");
  const [alert, setAlert] = useState({ type: "danger", message: "" });
  const [pageCurrent, setPageCurrent] = useState(1);
  const [metaData, setMetaData] = useState();

  const handleDateFromChange = (e) => {
    let newDateFrom = e.target.value;
    setDateFrom(newDateFrom);
    newDateFrom = newDateFrom.split("T");

    setstart_from(newDateFrom[0]);
  };

  function formatDate(dateString) {
    if (!dateString) return "";

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString("en-US", options);
  }

  const initialState = {
    customer_name: "",
    phone: "",
    num_of_people: 1,
    start_from: dateNow,
    end_at: end_time ? end_time : "",
  };

  const [inputs, setInputs] = useState(initialState);

  const handleStartTime = (e) => {
    const newDateFrom = e.target.value;
    setstart_time(newDateFrom);
    inputs.start_from = newDateFrom;
    setInputs(inputs);
  };

  const handleInputs = (event) => {
    setInputs((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    setLoading(true);
    event.preventDefault();
    setLoading(true);
    postRequest(
      `/pos/v1/merchant/${params?.merchantId}/reservation`,
      inputs,
      "POST",
      true
    )
      .then((res) => {
        Swal.fire({
          text: res.data.message,
          icon: "success",
        });

        setInputs(null);
      })
      .catch((error) => {
        console.log("err", error);
        // getErrorMessageFromResponse(error);

        Swal.fire({
          text: "You can't fulfill this request at this Day Time",
          icon: "error",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <div className=" w-full px-4 py-2 bg-gradient-to-r from-[#7DE143] to-[#055938] px-6 py-4 border-b rounded-t dark:border-gray-600">
        <h3 class="text-base font-semibold  text-white lg:text-xl">
          Add Reservation
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto my-8">
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block mb-2 font-medium text-gray-700"
          >
            Customer Name*
          </label>
          <input
            required
            type="text"
            name="customer_name"
            value={inputs?.customer_name ?? ""}
            onChange={handleInputs}
            placeholder="Enter Customer Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#055938]"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="phone"
            className="block mb-2 font-medium text-gray-700"
          >
            Phone*
          </label>
          <input
            type="number"
            id="phone"
            name="phone"
            value={inputs?.phone ?? ""}
            onChange={handleInputs}
            placeholder="Enter Phone"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#055938]"
            required
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="people"
            className="block mb-2 font-medium text-gray-700"
          >
            Number of People*
          </label>
          <input
            type="number"
            name="num_of_people"
            value={inputs?.num_of_people ?? ""}
            onChange={handleInputs}
            placeholder="Number of People"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#055938]"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="people"
            className="block mb-2 font-medium text-gray-700"
          >
            Start Time*
          </label>
          <input
            id="phone"
            type="datetime-local"
            name="start_from"
            value={start_time}
            onChange={handleStartTime}
            min={dateNow}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#055938]"
          />
        </div>
        <div className="mb-6">
          <button
            type="submit"
            disabled={loading == true ? loading : loading}
            className="rounded-[8px]  text-white w-full px-4 py-2 bg-gradient-to-r from-[#7DE143] to-[#055938] hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
          >
            {loading == true ? <CSpinner /> : "Save"}
          </button>
        </div>
      </form>
    </>
  );
};

export default Form;
