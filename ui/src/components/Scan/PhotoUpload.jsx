import React, { useState, useRef } from "react";
export default function PhotoUpload({ title, preview, setPreview }) {

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="scan-field">
      <label>{title}</label>
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {preview && (
        <img src={preview} alt="Selected preview" className="scan-preview-img" />
      )}
    </div>
  );
}
