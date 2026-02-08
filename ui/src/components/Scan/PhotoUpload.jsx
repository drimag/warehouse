import React, { forwardRef } from "react";

const PhotoUpload = forwardRef(({ preview, setPreview, title }, ref) => {
  return (
    <div className="scan-field">
      <label>{title}</label>
      
      <input
        type="file"
        accept="image/*"
        ref={ref}
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files[0]) {
            setPreview(URL.createObjectURL(e.target.files[0]));
          }
        }}
      />

      <div 
        className="custom-upload-box" 
        onClick={() => ref.current.click()}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="preview-small" />
        ) : (
          <span>Upload Photo</span>
        )}
      </div>
    </div>
  );
});

export default PhotoUpload;