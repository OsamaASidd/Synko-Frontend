import { FaClock } from "react-icons/fa";
import DateRangePicker from "rsuite/DateRangePicker";
import "rsuite/DateRangePicker/styles/index.css";

export default function CustomTimeRangePicker({ ...props }) {
  return (
    <DateRangePicker
      {...props}
      format="HH:mm:ss"
      className="w-[220px]"
      caretAs={FaClock}
    />
  );
}
