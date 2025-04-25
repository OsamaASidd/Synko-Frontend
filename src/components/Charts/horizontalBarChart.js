"use client"
import React from 'react';
import ReactApexChart from 'react-apexcharts';




const MyChart = (props) => {

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
                categories: props?.categories,
            },
            legend: {
                show: true
              }
        },


    };





    return (
        <div>
            <div id="chart">
                <ReactApexChart options={state.options} series={state.series} type="bar" height={350} />
            </div>
            <div id="html-dist"></div>
        </div>
    );

}


export default MyChart