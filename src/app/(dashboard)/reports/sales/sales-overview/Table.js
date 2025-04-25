import Link from "next/link";

import React from 'react';

// const TableComponent = ({ tableHeading, tableBody, type, tableLink }) => {
const TableComponent = (props) => {


    // console.log("table body is ",props)
    let tableData = props?.tableBody ? props?.tableBody : [[]];
    let tableHeadingData = props?.tableHeading ? props?.tableHeading : [];

    const createTableHeadings = () => {
        return (
            <thead>
                <tr className="bg-[#055938] ">
                    {tableHeadingData.map((heading, index) => (
                        <th key={index} className="px-7 py-3 text-[16px] font-semibold ">{heading}</th>
                    ))}
                </tr>
            </thead>
        );
    };

    // Function to create table body rows
    const createTableBody = () => {
        return (
            <tbody>
                {tableData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b bg-white text-[14px]">
                        {row.map((cell, cellIndex) => (

                            <td key={cellIndex} className="px-7 py-2 lg:py-2 whitespace-nowrap">
                                {(cellIndex == 0) ?

                                    <>
                                        {
                                            props?.tableLink == true ?

                                                <>
                                                    {(props?.byquery == false) ?

                                                        <>
                                                            <Link href={`/reports/sales/sales-overview/${props?.type}/${(cell).toLowerCase()}?${props?.query}`}>
                                                                {cell}
                                                            </Link>
                                                        </>
                                                        :
                                                        <>
                                                            {(props?.by_id == true) ?
                                                                <>
                                                                    <Link href={`/reports/sales/sales-overview/${props?.type}/${cell.id}?${props?.query}`}>
                                                                        {cell.name}
                                                                    </Link>
                                                                </>
                                                                :
                                                                <>
                                                                    <Link href={`/reports/sales/sales-overview/${props?.type}/${(cell.replace(" ", "-")).toLowerCase()}?${props?.query}`}>
                                                                        {cell}
                                                                    </Link>
                                                                </>
                                                            }
                                                            
                                                        </>
                                                    }

                                                </>
                                                :
                                                <>
                                                    {cell}
                                                </>
                                        }
                                    </>
                                    :
                                    <>
                                        {cell}
                                    </>
                                }
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        );
    };

    return (
        <div className="relative overflow-x-auto overflow-y-hidden">
            <table className="w-full border text-left">
                {createTableHeadings()}
                {createTableBody()}
            </table>
        </div>
    );
};

export default TableComponent;

