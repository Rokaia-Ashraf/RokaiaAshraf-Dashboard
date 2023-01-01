import { Pie } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

const SteteSchools = ({ allStates, totalSchoolsByState }) => {
  const chartData = {
    labels: allStates,
    datasets: [
      {
        label: `Total Schools:`,
        data: totalSchoolsByState,
        backgroundColor: [
          "rgba(120, 200, 150, 0.5)",
          "rgba(30, 99, 132, 0.5)",
          "rgba(180, 200, 40, 0.4)",
          "rgba(220, 162, 15, 0.5)",
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.3)",
          "rgba(70, 30, 220, 0.5)",
          "rgba(255, 206, 86, 0.4)",
          "rgba(140, 220, 170, 0.5)",
          "rgba(200, 206, 86, 0.2)",
          "rgba(75, 130, 170, 0.5)",
          "rgba(250, 99, 150, 0.2)",
          "rgba(120, 162, 15, 0.5)",
          "rgba(110, 99, 150, 0.2)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(110, 99, 132, 0.3)",
          "rgba(54, 162, 10, 0.5)",
          "rgba(255, 120, 86, 0.2)",
          "rgba(120, 92, 12, 0.2)",
          "rgba(60, 120, 86, 0.5)",
          "rgba(120, 92, 100, 0.4)",
          "rgba(54, 3, 235, 0.3)",
        ],
        borderColor: [
          "rgba(120, 200, 150, 0.7)",
          "rgba(30, 99, 132, 0.7)",
          "rgba(180, 200, 40, 0.7)",
          "rgba(220, 162, 15, 0.7)",
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(70, 30, 220, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(140, 220, 170, 0.7)",
          "rgba(200, 206, 86, 0.7)",
          "rgba(75, 130, 170, 0.7)",
          "rgba(250, 99, 150, 0.7)",
          "rgba(120, 162, 15, 0.7)",
          "rgba(110, 99, 150, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(110, 99, 132, 0.7)",
          "rgba(54, 162, 10, 0.7)",
          "rgba(255, 120, 86, 0.7)",
          "rgba(120, 92, 12, 0.7)",
          "rgba(60, 120, 86, 0.7)",
          "rgba(120, 92, 100, 0.7)",
          "rgba(54, 3, 235, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <div className="card card-header h6 mb-3">
        Total Schools in Each State
      </div>
      <Pie className="mb-5" data={chartData} />
    </>
  );
};

export default SteteSchools;
