// pages/index.tsx
import { useState } from "react";
import Papa from "papaparse";
import Button from "./button";

// Define types for the parsed CSV data
type CsvRow = {
  [key: string]: string | number; // The keys are dynamic, and values can be strings or numbers
};

export default function GameUpload({onUpload } : any) {
  const [csvData, setCsvData] = useState<CsvRow[]>([]); // An array of CSV rows
  const [fileName, setFileName] = useState<string>(""); // The name of the uploaded file
  const [errorMessage, setErrorMessage] = useState<string>(""); // Error message for validation

  // Handle file upload and parsing
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Safely get the first file

    // Reset error message
    setErrorMessage("");

    if (!file) {
      setErrorMessage("Please select a file to upload");
      return;
    }

    if (!file.name.endsWith(".csv")) {
      setErrorMessage("Please upload a valid CSV file");
      return;
    }

    setFileName(file.name);

    // Use PapaParse to read and parse the CSV file
    Papa.parse(file, {
      complete: (result: any) => {
        // Check if the result contains valid data
        if (result.data && result.data.length > 0) {
          setCsvData(result.data as CsvRow[]); // Type casting as CsvRow[]
        } else {
          setErrorMessage("No valid data found in the CSV file");
        }
      },
      error: (error: any) => {
        setErrorMessage(`Error parsing CSV: ${error.message}`);
      },
      header: true, // Treat the first row as headers
      skipEmptyLines: true, // Skip empty lines
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 className="text-xl">Upload Game</h1>
      <ul className="list-disc ml-10">
        <li>
          Download this{" "}
          <a
            className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
            href={"/templates/template.csv"}
          >
            Template
          </a>
        </li>
        <li>Fill up the template</li>
        <li>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            placeholder="Upload CSV"
          />
        </li>
      </ul>
      <br />

      {/* CSV file upload input */}

      {fileName && <h2>Uploaded File: {fileName}</h2>}

      {/* Display Error Message */}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      {/* Display the CSV data */}
      {csvData.length > 0 && !errorMessage && (
        <div className="mb-5 overflow-auto h-full w-full max-h-52">
          <table border={1} className="overflow-auto w-full">
            <thead>
              <tr>
                {Object.keys(csvData[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, idx) => (
                    <td key={idx}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Button
        onClick={() => {onUpload(csvData)}}
        isLoading={false}
        loadingText="Loading..."
        type={"button"}
      >
        Proceed
      </Button>
    </div>
  );
}
