import React, { useRef } from "react";

export default function UploadResume({ onFileSelect }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="border-2 border-dashed rounded-lg p-6 text-center">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current.click()}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md"
      >
        Choose Resume File
      </button>
    </div>
  );
}
