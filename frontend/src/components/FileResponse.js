/* File: /home/cholland/repos/smart-codegen/frontend/src/components/FileResponse.js */

import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import axios from 'axios';
import config from '../config';

const FileResponse = forwardRef(({ content, language, filePath, responseIndex, handleRefresh }, ref) => {
  const [fileWritten, setFileWritten] = useState(false);
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [textAreaContent, setTextAreaContent] = useState(content);
  const textAreaRef = useRef(null);

  const handleWriteFile = async () => {
    try {
      setWriting(true);
      setDisabled(true);
      setError(null);
      console.log(`Writing file path: ${filePath}`);

      const cleanedContent = textAreaContent.replace(/\/\* File: .* \*\//, '').trim();

      const response = await axios.post(`${config.backendUrl}/write_file`, {
        filePath,
        fileContent: cleanedContent
      });

      if (response.status === 200) {
        setFileWritten(true);
        handleRefresh();
        setTimeout(() => {
          setFileWritten(false);
          setWriting(false);
          setDisabled(false);
        }, 7000);
      } else {
        throw new Error(`Error writing file: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error writing file:', error);
      setError(`Error writing file: ${error.message}`);
      setWriting(false);
      setDisabled(false);
    }
  };

  useImperativeHandle(ref, () => ({
    writeFile: handleWriteFile
  }));

  const adjustHeight = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [textAreaContent]);

  const preventScroll = (e) => {
    e.preventDefault();
  };

  return (
    <div className="bg-green-100 p-2 rounded mt-2" data-file-response={responseIndex}>
      <textarea
        ref={textAreaRef}
        className="bg-white p-2 rounded w-full"
        value={textAreaContent}
        onChange={(e) => setTextAreaContent(e.target.value)}
        onInput={adjustHeight}
        onWheel={preventScroll}
      />
      <div className="mt-2">
        {writing ? (
          <span className="text-green-500">Writing file to file system: {filePath}</span>
        ) : fileWritten ? (
          <span className="text-green-500">File written to {filePath}</span>
        ) : error ? (
          <span className="text-red-500">{error}</span>
        ) : (
          <button
            onClick={handleWriteFile}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
            disabled={disabled}
          >
            Write Change
          </button>
        )}
      </div>
    </div>
  );
});

export default FileResponse;
