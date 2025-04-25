import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import moment from "moment";

const ReactApexChartCustom = dynamic(() => import("react-apexcharts"), {
  ssr: false, // Importing without server-side rendering
});

export default function BasicLineChart({
  data,
  categoryKey,
  seriesKey,
  currencySymbol = "€",
  isMultiMonth = false,
  isMultiData = false,
  customCategories = null, // Accept custom categories as a prop
}) {
  const [series, setSeries] = useState([{ data: [] }]);

  const [options, setOptions] = useState({
    chart: {
      height: 350,
      type: "line",
      zoom: {
        enabled: true,
      },
      toolbar: {
        show: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#7DE143"],
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        gradientToColors: ["#055938"],
        stops: [0, 100],
      },
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"],
        opacity: 0.5,
      },
    },
    xaxis: {},
    tooltip: {
      y: {
        formatter: function (val) {
          return `${currencySymbol}${val.toFixed(2)}`;
        },
      },
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return `${currencySymbol}${val}`;
        },
      },
    },
  });

  useEffect(() => {
    if (data && data?.length > 0) {
      let newCategories = null;

      if (customCategories) {
        // Use custom categories if provided
        newCategories = customCategories;
      } else if (!isMultiData) {
        // Generate categories dynamically from data
        newCategories = data.map((item) =>
          isMultiMonth
            ? moment(item[categoryKey]).format("MMM, YYYY")
            : moment(item[categoryKey]).format("MMM D, YYYY")
        );
      }

      if (!isMultiData) {
        const newSeries = seriesKey.map((key) => {
          const split = key.split(",");
          return {
            name: split[1],
            data: data.map((item) => parseFloat(item[split[0]])),
          };
        });
        setSeries(newSeries);
      } else {
        setSeries(data);
      }

      // Update the options to reflect the new categories
      setOptions((prev) => ({
        ...prev,
        xaxis: {
          ...prev.xaxis,
          categories: newCategories,
        },
      }));
    }
  }, [data, categoryKey, seriesKey, customCategories]);

  return (
    <ReactApexChartCustom
      options={options}
      series={series}
      type="line"
      height={300}
      style={{ position: "relative", zIndex: 0 }}
    />
  );
}
