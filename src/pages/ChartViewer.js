import React, { useState, useRef } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Button,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import WarningIcon from "@mui/icons-material/Warning";
import ImageIcon from "@mui/icons-material/Image";
import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InsertChartIcon from "@mui/icons-material/InsertChart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

const ChartViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data = [], columns = [] } = location.state || {};

  const [xKey, setXKey] = useState(columns[0] || "");
  const [yKeys, setYKeys] = useState(columns[1] ? [columns[1]] : []);
  const [chartType, setChartType] = useState("Bar");
  const chartRef = useRef(null);

  if (!data.length || !columns.length) {
    return (
      <Box p={4} sx={{ textAlign: "center" }}>
        <Typography color="error" variant="h6">
          No chart data found.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={() => navigate("/")}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
  ];

  const getChartData = () => {
    const xValues = data.map((item) => item[xKey]);

    if (chartType === "Pie") {
      const yKey = yKeys[0];
      const yValues = data
        .map((item) => parseFloat(item[yKey]))
        .filter((v) => !isNaN(v));
      return {
        labels: xValues.slice(0, yValues.length),
        datasets: [
          {
            label: `${yKey} Distribution`,
            data: yValues,
            backgroundColor: colors.slice(0, yValues.length),
            borderColor: "#fff",
            borderWidth: 2,
          },
        ],
      };
    }

    if (chartType === "Scatter") {
      const yKey = yKeys[0];
      return {
        datasets: [
          {
            label: `${yKey} vs ${xKey}`,
            data: data.map((item) => ({
              x: parseFloat(item[xKey]),
              y: parseFloat(item[yKey]),
            })),
            backgroundColor: colors[1],
            pointRadius: 5,
            showLine: false,
          },
        ],
      };
    }

    return {
      labels: xValues,
      datasets: yKeys.map((yKey, i) => ({
        label: yKey,
        data: data.map((item) => parseFloat(item[yKey])),
        backgroundColor: chartType === "Area" ? `${colors[i % colors.length]}88` : colors[i % colors.length],
        borderColor: colors[i % colors.length],
        fill: chartType === "Area",
        tension: chartType === "Area" ? 0.4 : 0.3,
        borderWidth: 2,
        pointRadius: chartType === "Area" ? 0 : 3,
      })),
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { enabled: true },
    },
  };

  const handleDownloadPNG = async () => {
    const chartCanvas = chartRef.current;
    if (!chartCanvas) return;
    const canvas = await html2canvas(chartCanvas);
    const link = document.createElement("a");
    link.download = `${chartType}_chart.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleDownloadPDF = async () => {
    const chartCanvas = chartRef.current;
    if (!chartCanvas) return;
    const canvas = await html2canvas(chartCanvas);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
    pdf.save(`${chartType}_chart.pdf`);
  };

  const showSingleOnlyWarning = (chartType === "Pie" || chartType === "Scatter") && yKeys.length > 1;

  return (
    <Box display="flex" height="90vh">
      <Box sx={{ width: 300, p: 2, borderRight: "1px solid #ccc" }}>
        <Typography variant="h6" gutterBottom>Controls</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>X-Axis</InputLabel>
          <Select value={xKey} onChange={(e) => setXKey(e.target.value)}>
            {columns.map((col) => (
              <MenuItem key={col} value={col}>{col}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Y-Axis (Multi)</InputLabel>
          <Select
            multiple
            value={yKeys}
            onChange={(e) => setYKeys(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {columns.map((col) => (
              <MenuItem key={col} value={col}>{col}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Chart Type</InputLabel>
          <Select value={chartType} onChange={(e) => setChartType(e.target.value)}>
            <MenuItem value="Bar">Bar</MenuItem>
            <MenuItem value="Column">Column</MenuItem>
            <MenuItem value="Line">Line</MenuItem>
            <MenuItem value="Area">Area</MenuItem>
            <MenuItem value="Pie">Pie</MenuItem>
            <MenuItem value="Scatter">Scatter</MenuItem>
          </Select>
        </FormControl>

        <Button variant="outlined" startIcon={<ImageIcon />} fullWidth sx={{ mb: 1 }} onClick={handleDownloadPNG}>
          PNG
        </Button>
        <Button variant="outlined" startIcon={<PictureAsPdfIcon />} fullWidth onClick={handleDownloadPDF}>
          PDF
        </Button>
      </Box>

      <Box sx={{ flex: 1, p: 3 }}>
        <Typography variant="h5" gutterBottom><InsertChartIcon sx={{ mr: 1 }} /> Chart View</Typography>
        {showSingleOnlyWarning && (
          <Typography color="error"><WarningIcon /> Only one Y-axis supported for this chart type.</Typography>
        )}
        <Box ref={chartRef} sx={{ backgroundColor: "#fff", p: 2, borderRadius: 2, boxShadow: 2 }}>
          {chartType === "Bar" && <Bar data={getChartData()} options={{ ...options, indexAxis: "y" }} />}
          {chartType === "Column" && <Bar data={getChartData()} options={options} />}
          {chartType === "Line" && <Line data={getChartData()} options={options} />}
          {chartType === "Area" && <Line data={getChartData()} options={options} />}
          {chartType === "Pie" && <Pie data={getChartData()} options={options} />}
          {chartType === "Scatter" && <Line data={getChartData()} options={{
            responsive: true,
            plugins: { legend: { position: "top" } },
            scales: {
              x: { type: "linear", position: "bottom", title: { display: true, text: xKey } },
              y: { title: { display: true, text: yKeys[0] } },
            },
            elements: { line: { tension: 0, borderWidth: 1, fill: false }, point: { radius: 5 } },
          }} />}
        </Box>
      </Box>
    </Box>
  );
};

export default ChartViewer;
