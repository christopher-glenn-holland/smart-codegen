/* File: /home/cholland/repos/smart-codegen/frontend/src/components/ChatContainer.js */

import React from 'react';
import ChatBox from './ChatBox';
import MessageInput from './MessageInput';

function ChatContainer({
  chatHistory,
  setChatHistory,
  chatBoxRef,
  inputMessage,
  setInputMessage,
  uploadedFileContent,
  selectedFiles,
  processing,
  handleFileChange,
  file,
  setFile,
  clearFile,
  handleDownloadContext,
  handleSend,
  selectedModel,
  selectedFolder,
  rootPath,
  resetTotals,
  handleLoadLastResponse,
  handleRefresh
}) {
  const totalInputTokens = chatHistory.reduce((acc, chat) => acc + (chat.role === 'user' ? chat.input_tokens : 0), 0);
  const totalInputCost = chatHistory.reduce((acc, chat) => acc + (chat.role === 'user' ? parseFloat(chat.input_cost) : 0), 0).toFixed(8);
  const totalOutputTokens = chatHistory.reduce((acc, chat) => acc + (chat.role === 'bot' ? chat.output_tokens : 0), 0);
  const totalOutputCost = chatHistory.reduce((acc, chat) => acc + (chat.role === 'bot' ? parseFloat(chat.output_cost) : 0), 0).toFixed(8);

  return (
    <div className="flex-1 flex flex-col ml-2 mr-4">
      <div ref={chatBoxRef} className="flex-1 flex flex-col bg-white rounded shadow-md p-4 mb-2 overflow-y-auto">
        <ChatBox chatHistory={chatHistory} processing={processing} handleRefresh={handleRefresh} />
      </div>
      <MessageInput
        handleSend={(message, file, setMessage) => handleSend(message, file, setMessage, selectedModel, selectedFolder, rootPath)}
        handleFileChange={handleFileChange}
        file={file}
        setFile={setFile}
        clearFile={clearFile}
        processing={processing}
        setMessage={setInputMessage}
        handleDownloadContext={handleDownloadContext}
        handleLoadLastResponse={handleLoadLastResponse}
      />
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handleDownloadContext}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          disabled={processing}
        >
          Download Context
        </button>
        <div className="text-center flex-1 mx-4">
          <strong>Total:</strong><br />
          Total Input Tokens: {totalInputTokens} ({totalInputCost} USD)<br />
          Total Output Tokens: {totalOutputTokens} ({totalOutputCost} USD)
        </div>
        <button
          onClick={resetTotals}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
          disabled={processing}
        >
          Reset Totals
        </button>
      </div>
    </div>
  );
}

export default ChatContainer;
