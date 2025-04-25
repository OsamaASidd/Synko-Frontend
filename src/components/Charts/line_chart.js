
"use client"
import React from 'react';
import dynamic from "next/dynamic";
const ReactApexChartCustom = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

const Line_Chart = (props) => {
   
    let state = {
        series: [{
            data: props?.data ? props?.data : []
        }],
        options: {
            chart: {
                type: 'bar',
                stacked: true,
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    borderRadiusApplication: 'end',
                    horizontal: true,
                    barHeight: '20px'
                }
            },
            dataLabels: {
                enabled: false
            },
            xaxis: {
                categories: props?.categories ? props?.categories : [],
            },
            legend: {
                show: true
            }
        },


    };


    
    return (
        <div>
            <div id="chart">
                <ReactApexChartCustom
                    options={state.options}
                    series={state.series}
                    type="area"
                    height={200}
                />
            </div>
            <div id="html-dist"></div>
        </div>
    );

}


export default Line_Chart