/* File: /home/cholland/repos/smart-codegen/frontend/src/components/ChatBox.js */

import React, { useState, useRef } from 'react';
import FileResponse from './FileResponse';
import { processResponseMessage } from '../utils/messageUtils';

function ChatBox({ chatHistory, processing, handleRefresh }) {
  const [writingAllChanges, setWritingAllChanges] = useState(false);
  const [disabledAll, setDisabledAll] = useState(false);
  const fileResponseRefs = useRef([]);

  const handleWriteAllChanges = async (responseIndex) => {
    setWritingAllChanges(true);
    setDisabledAll(true);

    const refs = fileResponseRefs.current[responseIndex];
    if (refs) {
      for (let ref of refs) {
        if (ref && ref.writeFile) {
          await ref.writeFile();
        }
      }
    }

    setTimeout(() => {
      setWritingAllChanges(false);
      setDisabledAll(false);
    }, 7000);
  };

  return (
    <div className="chat-box">
      {chatHistory.map((chat, index) => {
        const { parts } = processResponseMessage(chat.message);
        const hasFileChanges = parts.some(part => part.type === 'code');

        fileResponseRefs.current[index] = [];

        return (
          <div key={index} className={`p-4 mb-4 rounded-lg ${chat.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'}`}>
            {chat.role === 'user' && (
              <>
                <div>{chat.message.split('\n')[0]}</div>
                <div className="text-sm text-gray-600 mt-2">
                  Input Tokens: {chat.input_tokens} ({parseFloat(chat.input_cost).toFixed(5)} USD)
                </div>
              </>
            )}
            {chat.role === 'bot' && (
              <>
                {parts.map((part, i) => (
                  <div key={i} className="mt-2">
                    {part.type === 'text' ? (
                      <div>{part.content}</div>
                    ) : (
                      <FileResponse
                        ref={(el) => fileResponseRefs.current[index].push(el)}
                        content={part.content}
                        language={part.language}
                        filePath={part.filePath}
                        responseIndex={index}
                        handleRefresh={handleRefresh}
                      />
                    )}
                  </div>
                ))}
                {hasFileChanges && (
                  <div className="flex justify-center mt-4">
                    {writingAllChanges ? (
                      <span className="text-green-500">
                        Writing all files to the file system...Please wait...
                      </span>
                    ) : (
                      <button
                        onClick={() => handleWriteAllChanges(index)}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
                        disabled={disabledAll || processing}
                      >
                        Write All Changes
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
      {processing && <div className="p-4 mb-4 rounded-lg bg-gray-100">Processing...</div>}
    </div>
  );
}

export default ChatBox;
