import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

function Dragordrop({ setfile }) {
  const maxSize = 5 * 1024 * 1024;
  const [filename, setFileNm] = useState(null);
  const onDrop = useCallback(
    (acceptedFiles) => {
      setFileNm(acceptedFiles[0].name);
      setfile(acceptedFiles[0]);
    },
    [setfile]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: maxSize,
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <div className="drag-drop">
        {!filename ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 drag-svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 drag-svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12"
            />
          </svg>
        )}

        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : filename ? (
          <p>FileName: {filename}</p>
        ) : (
          <p>Upload Resume</p>
        )}
      </div>
    </div>
  );
}

export default Dragordrop;
