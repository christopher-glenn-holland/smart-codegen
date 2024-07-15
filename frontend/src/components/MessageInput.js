/* File: /home/cholland/repos/smart-codegen/frontend/src/components/MessageInput.js */

import React, { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { FiTrash2 } from 'react-icons/fi';

export default function MessageInput({
  handleSend,
  handleFileChange,
  file,
  setFile,
  clearFile,
  processing,
  setMessage,
  handleLoadLastResponse // Ensure this is here
}) {
  const [message, setInputMessage] = useState('');

  const onSend = () => {
    if (!processing) {
      handleSend(message, file, setInputMessage);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !processing) {
      onSend();
    }
  };

  return (
    <div className="flex flex-col p-2 border-t">
      <div className="flex items-center mb-2">
        {!file && (
          <input
            type="file"
            onChange={(e) => {
              handleFileChange(e);
              setFile(e.target.files[0]);
            }}
            className="mr-2"
            disabled={processing}
          />
        )}
        {file && (
          <div className="flex items-center">
            <span className="mr-2">{file.name}</span>
            <button onClick={clearFile} disabled={processing} className="text-red-500">
              <FiTrash2 />
            </button>
          </div>
        )}
        <button
          onClick={() => {
            handleLoadLastResponse();
          }}
          disabled={processing}
          className="ml-2 text-blue-500"
        >
          Load Last Response
        </button>
      </div>
      <div className="flex items-center">
        <input
          type="text"
          className="flex-1 border p-2 rounded mr-2"
          value={message}
          onChange={(e) => {
            setInputMessage(e.target.value);
            setMessage(e.target.value);
          }}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          disabled={processing}
        />
        <button
          onClick={onSend}
          className={`px-4 py-2 text-white rounded ${
            processing ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'
          }`}
          disabled={processing}
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
}
