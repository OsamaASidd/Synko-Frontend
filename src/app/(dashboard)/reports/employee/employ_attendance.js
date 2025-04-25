import { GlobalContext } from "@/context";
import { useContext, useEffect, useState } from "react";
// import CSpinner from "@/components/common/CSpinner";
import Select from "react-select";
import { getRequest } from "@/utils/apiFunctions";
import Swal from "sweetalert2";

export default function AddEmployeAttendance() {
  const { merchant, user } = useContext(GlobalContext);
  // const [loading, setLoading] = useState(false)

  let defaultValue = { value: "0", label: "Select Employee" };

  const [options, setOptions] = useState(defaultValue);
  const [selectedValue, setselectedValue] = useState(defaultValue);
  const [employID, setemployID] = useState("");

  const handleChange = (value) => {
    setemployID(value?.value);
    setselectedValue(value);
  };

  const getAllEmployee = () => {
    let ignore = true;
    getRequest(`/pos/v1/merchant/${merchant?.id}/employe/all?search=`, ignore)
      .then((res) => {
        // console.log("Data fetched:", res.data);
        // Handle success case here
        if (res.data.length > 0) {
          let optionsAry = [];

          for (var x = 0; x < res.data.length; x++) {
            let object = {
              value: res?.data[x].id,
              label: `${res?.data[x].name}`,
            };
            optionsAry.push(object);
          }
          optionsAry.unshift(defaultValue[0]);
          setOptions(optionsAry);
        } else {
          setOptions([{ value: "0", label: "no data found" }]);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Handle error case here
      })
      .finally(() => {});
  };

  const addAttendance = (isCheckin) => {
    let ignore = true;
    getRequest(
      `/pos/v1/merchant/${merchant?.id}/attendence/${employID}?isCheckin=${isCheckin}`,
      ignore
    )
      .then((res) => {
        if (res.status == 200) {
          Swal.fire({
            text: res.data.message,
            icon: "success",
          });
        } else {
          Swal.fire({
            text: res.data.message,
            icon: "error",
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Handle error case here
      })
      .finally(() => {});
  };

  useEffect(() => {
    if (user !== null && merchant !== null) {
      getAllEmployee();
    }
  }, [user, merchant]);

  function handleCheckinout(isCheckin) {
    if (selectedValue.value != "0") {
      addAttendance(isCheckin);
    } else {
      Swal.fire({
        text: "Select Employe First",
        icon: "error",
      });
    }
  }

  return (
    <div className="flex flex-col w-[300px] m-auto">
      <div>
        <Select
          id="sort-by"
          name="sort-by"
          className="px-4 py-3 border outline-none rounded-lg bg-white text-black w-full mb-5"
          onChange={handleChange}
          value={selectedValue}
          options={options}
          placeholder="Select Employee"
        />
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            handleCheckinout(true);
          }}
          className="cursor-pointer px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
        >
          <span className="mr-2">Check in</span>
        </button>
        <button
          onClick={() => {
            handleCheckinout(false);
          }}
          className="cursor-pointer px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
        >
          <span className="mr-2">Check Out</span>
        </button>
      </div>
    </div>
  );
}
