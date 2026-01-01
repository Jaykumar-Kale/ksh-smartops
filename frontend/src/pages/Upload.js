import { useState } from "react";
import api from "../services/api";
import "./Upload.css";

function Upload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an Excel file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/operations/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(`Upload successful. Saved: ${res.data.saved}`);
    } catch (error) {
      console.error(error);
      setMessage("Upload failed. Please try again.");
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload OT CSV Data</h2>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload}>Upload File</button>

      {message && <p className="upload-message">{message}</p>}
    </div>
  );
}

export default Upload;
