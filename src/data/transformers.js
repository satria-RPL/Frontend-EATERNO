import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Registrasi komponen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

import { Bar, Line, Doughnut } from "react-chartjs-2";
import "chart.js/auto";

// src/data/transformers.js

// revenueData: array [{label, revenue, cost}, ...]
// returns Chart.js data object for line chart
export function buildLineChartData(revenueData) {
  const labels = revenueData.map(r => r.label);
  const revenue = revenueData.map(r => Number(r.revenue));
  const cost = revenueData.map(r => Number(r.cost));

  return {
    labels,
    datasets: [
      {
        label: "Revenue",
        data: revenue,
        borderColor: "rgb(54,162,235)",
        backgroundColor: "rgba(54,162,235,0.1)",
        tension: 0.4,
      },
      {
        label: "Cost",
        data: cost,
        borderColor: "rgb(255,99,132)",
        backgroundColor: "rgba(255,99,132,0.1)",
        tension: 0.4,
      },
    ],
  };
}

// sourceData: array [{ label: 'Ads', value: 35 }, ...] OR derived from revenueData
export function buildBarChartData(sourceData) {
  return {
    labels: sourceData.map(s => s.label),
    datasets: [
      {
        label: "Count",
        data: sourceData.map(s => Number(s.value)),
        backgroundColor: ["#3b82f6", "#facc15", "#fda4af"],
      },
    ],
  };
}

export function buildDoughnutData(sourceData) {
  const labels = sourceData.map(item => item.label);
  const values = sourceData.map(item => item.value);
  const colors = sourceData.map(item => item.color);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderWidth: 0
      }
    ]
  };

  const options = {
    cutout: "70%", // untuk membuat bentuk donat
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          color: "#4B5563"
        }
      }
    }
  };

  return { data, options };
}
