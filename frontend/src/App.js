/* File: /home/cholland/repos/smart-codegen/frontend/src/App.js */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import config from './config';
import ChatContainer from './components/ChatContainer';
import FolderHandler from './components/FolderHandler';
import { processResponseMessage } from './utils/messageUtils';

function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [folderTree, setFolderTree] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [uploadedFileContent, setUploadedFileContent] = useState('');
  const [processing, setProcessing] = useState(false);
  const [folders, setFolders] = useState([]);
  const [file, setFile] = useState(null);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [rootPath, setRootPath] = useState('');
  const chatBoxRef = useRef(null);

  useEffect(() => {
    fetchFolders();
    fetchRootPath();
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const fetchFolders = async () => {
    try {
      const response = await axios.get(`${config.backendUrl}/folders`);
      setFolders(response.data.folders);
      setFolderTree(null);
      setSelectedFolder('');
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchRootPath = async () => {
    try {
      const response = await axios.get(`${config.backendUrl}/root_path`);
      setRootPath(response.data.rootPath);
    } catch (error) {
      console.error('Error fetching root path:', error);
    }
  };

  const fetchFolderTreeWithCheckedState = async (folderPath) => {
    const checkedPaths = gatherCheckedPaths(folderTree);
    try {
      const response = await axios.get(`${config.backendUrl}/folder_tree`, { params: { path: folderPath } });
      const newTree = restoreCheckedState(response.data, checkedPaths);
      setFolderTree(newTree);
      await updateSelectedFiles(newTree);
    } catch (error) {
      console.error('Error fetching folder tree:', error);
    }
  };

  const gatherCheckedPaths = (node) => {
    if (!node) return [];
    let checkedPaths = [];
    if (node.isChecked) {
      checkedPaths.push(node.path);
    }
    if (node.children) {
      node.children.forEach((child) => {
        checkedPaths = checkedPaths.concat(gatherCheckedPaths(child));
      });
    }
    return checkedPaths;
  };

  const restoreCheckedState = (node, checkedPaths) => {
    if (!node) return node;
    node.isChecked = checkedPaths.includes(node.path);
    if (node.children) {
      node.children = node.children.map((child) => restoreCheckedState(child, checkedPaths));
    }
    return node;
  };

  const updateSelectedFiles = async (node) => {
    const gatherSelectedFiles = (node) => {
      let files = [];
      if (!node) return files;
      if (!node.isDirectory && node.isChecked) {
        files.push({ path: node.path, content: null });
      }
      if (node.children) {
        node.children.forEach((child) => {
          files = files.concat(gatherSelectedFiles(child));
        });
      }
      return files;
    };

    const selectedFiles = gatherSelectedFiles(node);
    const updatedFiles = await Promise.all(
      selectedFiles.map(async (file) => {
        if (!file.content) {
          const response = await axios.get(`${config.backendUrl}/file_content`, { params: { path: file.path } });
          return { path: file.path, content: response.data.content };
        }
        return file;
      })
    );
    setSelectedFiles(updatedFiles);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedFileContent(event.target.result);
    };
    reader.readAsText(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setUploadedFileContent('');
  };

  const resetTotals = () => {
    setChatHistory((prevChatHistory) =>
      prevChatHistory.map((chat) => ({
        ...chat,
        input_tokens: 0,
        input_cost: 0,
        output_tokens: 0,
        output_cost: 0
      }))
    );
  };

  const handleSend = async (message, file, setMessage, selectedModel, selectedFolder, rootPath) => {
    if (!message && selectedFiles.length === 0 && !uploadedFileContent) {
      alert("Please provide a message, select files, or upload a file.");
      return;
    }

    setProcessing(true);

    try {
      const files = selectedFiles.map((file) => ({
        path: file.path,
        content: file.content
      }));

      if (uploadedFileContent) {
        files.push({
          path: file ? file.name : 'Uploaded File',
          content: uploadedFileContent
        });
      }

      const fullContextResponse = await axios.post(`${config.backendUrl}/download_context`, {
        files,
        prompt: message,
        context: '',
        previous_context: ''
      });

      const fullContext = fullContextResponse.data;

      const formData = new FormData();
      formData.append('prompt', message);
      formData.append('context', fullContext);
      formData.append('model', selectedModel);
      formData.append('selectedFolder', selectedFolder);
      formData.append('rootPath', rootPath);
      if (file) {
        formData.append('file', file);
      }

      const response = await axios.post(`${config.backendUrl}/process`, formData);
      const { response: responseMessage, output_tokens, input_tokens, input_cost, output_cost, file_path } = JSON.parse(response.data.body);

      const { explanation, code, language } = processResponseMessage(responseMessage || "");

      setChatHistory((prevChatHistory) => {
        const updatedHistory = prevChatHistory.map((item, index) => {
          if (index === prevChatHistory.length - 1) {
            return {
              ...item,
              isProcessing: false
            };
          }
          return item;
        });

        return [
          ...updatedHistory,
          {
            role: 'user',
            message: `${message}\n\nInput Tokens: ${input_tokens} (${parseFloat(input_cost).toFixed(8)} USD)`,
            input_tokens,
            input_cost: parseFloat(input_cost).toFixed(8),
            isProcessing: false
          },
          {
            role: 'bot',
            message: responseMessage,
            explanation,
            code,
            language,
            output_tokens,
            output_cost: parseFloat(output_cost).toFixed(8),
            file_path
          }
        ];
      });

      setMessage('');
      setInputMessage('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadContext = async () => {
    const files = selectedFiles.map((file) => ({
      path: file.path,
      content: file.content
    }));

    if (uploadedFileContent) {
      files.push({
        path: file ? file.name : 'Uploaded File',
        content: uploadedFileContent
      });
    }

    try {
      const fullContextResponse = await axios.post(`${config.backendUrl}/download_context`, {
        files,
        prompt: inputMessage,
        context: '',
        previous_context: ''
      });

      const fullContext = fullContextResponse.data;

      const blob = new Blob([fullContext], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'context.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading context:', error);
    }
  };

  const handleLoadLastResponse = async () => {
    try {
      setProcessing(true);
      const response = await axios.get(`${config.backendUrl}/last_response`);
      const { response: responseMessage, output_tokens, input_tokens, input_cost, output_cost } = response.data;

      setChatHistory((prevChatHistory) => [
        ...prevChatHistory,
        {
          role: 'bot',
          message: responseMessage,
          output_tokens,
          input_tokens,
          input_cost: parseFloat(input_cost).toFixed(8),
          output_cost: parseFloat(output_cost).toFixed(8),
        }
      ]);
    } catch (error) {
      console.error('Error loading last response:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleRefresh = () => {
    console.log("Refreshing folder tree...");
    fetchFolderTreeWithCheckedState(selectedFolder);
  };

  return (
    <div className="flex h-screen">
      <FolderHandler
        folders={folders}
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
        setFolderTree={setFolderTree}
        setSelectedFiles={setSelectedFiles}
        folderTree={folderTree}
        fetchFolders={fetchFolders}
        fetchFolderTreeWithCheckedState={fetchFolderTreeWithCheckedState} // Pass the function to FolderHandler
        selectedModel={selectedModel}
        handleModelChange={(e) => setSelectedModel(e.target.value)}
        rootPath={rootPath}
        setRootPath={setRootPath}
      />
      <ChatContainer
        chatHistory={chatHistory}
        setChatHistory={setChatHistory}
        chatBoxRef={chatBoxRef}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        uploadedFileContent={uploadedFileContent}
        setUploadedFileContent={setUploadedFileContent}
        selectedFiles={selectedFiles}
        processing={processing}
        setProcessing={setProcessing}
        handleFileChange={handleFileChange}
        file={file}
        setFile={setFile}
        clearFile={clearFile}
        handleDownloadContext={handleDownloadContext}
        handleSend={handleSend}
        selectedModel={selectedModel}
        selectedFolder={selectedFolder}
        rootPath={rootPath}
        resetTotals={resetTotals}
        handleLoadLastResponse={handleLoadLastResponse}
        handleRefresh={handleRefresh} // Pass handleRefresh to ChatContainer
      />
    </div>
  );
}

export default App;
