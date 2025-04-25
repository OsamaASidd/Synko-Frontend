import React from "react";

const HorizontalBarGraph = ({ data }) => {
  // Determine the maximum quantity to calculate the width of bars
  const maxQuantity = Math.max(...data.map((item) => item.quantity));

  return (
    <div className="horizontal-bar-graph">
      {data.map((item) => (
        <div key={item.category} className="bar-container  mt-4">
          <div className="bar-label">{item.category}</div>
          <div className="flex items-center">
            <div
              className="ml-2 mr-2 bg-gray-300 w-[90%]"
              style={{ borderRadius: "10px" }}
            >
              <div
                title={item?.date + " " + item?.time}
                className="bar bg-gradient-to-r from-[#13AAE0] to-[#18D89D] rounded-10 "
                style={{
                  width: `${(item.quantity / maxQuantity) * 100}%`,
                  height: "15px",
                  borderRadius: "10px",
                }}
              ></div>
            </div>

            <div className="quantity flex-grow">{item.quantity} Sold</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HorizontalBarGraph;
