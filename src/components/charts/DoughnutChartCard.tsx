import React from "react";
import { Doughnut } from "react-chartjs-2";
import { buildDoughnutData } from "@/data/transformers";
import sourceData from "@/data/sourceData.json";


const DoughnutChartCard = () => {
const { data, options } = buildDoughnutData(sourceData);
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm w-[500px] h-[393px] border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Total Income
      </h2>
      <div className="relative flex justify-center w-[192px] h-[192px] mx-auto">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col m-5">
          <p className="text-2xl font-bold text-gray-900">$80,000</p>
        </div>
      </div>
    </div>
  );
};

export default DoughnutChartCard;
