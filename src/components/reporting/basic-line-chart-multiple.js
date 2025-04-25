import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import moment from "moment";

const ReactApexChartCustom = dynamic(() => import("react-apexcharts"), {
  ssr: false, // Importing without server-side rendering
});

export default function BasicLineChartMultiple({
  data,
  categoryKey,
  seriesKey,
  currencySymbol = "€",
  isMultiMonth = false,
  isMultiData = false,
}) {
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);

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
      curve: "straight",
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
        opacity: 0.5,
      },
    },
    xaxis: {},
    tooltip: {
      y: {
        formatter: function (val) {
          return `${currencySymbol}${val.toFixed(2)}`; // Dynamically formatted tooltip
        },
      },
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return `${currencySymbol}${val}`; // Dynamically formatted y-axis labels
        },
      },
    },
  });

  useEffect(() => {
    if (data && data.length > 0) {
      const newCategoriesSet = new Set();
      const newSeries = [];

      data.forEach((menuItemData) => {
        if (menuItemData.length > 0) {
          const menuItemName = menuItemData[0].menu_item_name;
          const salesData = menuItemData.map((item) => {
            const formattedDate = moment(item[categoryKey], "HH:mm:ss").format(
              "HH:mm:ss"
            );

            newCategoriesSet.add(formattedDate);

            return {
              x: formattedDate,
              y: parseFloat(item.total_sales),
            };
          });

          newSeries.push({
            name: menuItemName,
            data: salesData,
          });
        }
      });

      const newCategories = Array.from(newCategoriesSet).sort((a, b) =>
        moment(a, "HH:mm:ss").diff(moment(b, "HH:mm:ss"))
      );
      setCategories(newCategories);

      setSeries(newSeries);

      setOptions((prev) => ({
        ...prev,
        xaxis: { ...prev.xaxis, categories: newCategories },
      }));
    }
  }, [data, categoryKey, seriesKey, isMultiData, isMultiMonth]);

  return (
    <>
      <ReactApexChartCustom
        options={options}
        series={series}
        type="line"
        height={300}
      />
    </>
  );
}
