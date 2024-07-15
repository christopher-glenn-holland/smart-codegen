import React, { useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import FolderSelector from './FolderSelector';

function FolderHandler({
  folders,
  selectedFolder,
  setSelectedFolder,
  setFolderTree,
  setSelectedFiles,
  folderTree,
  fetchFolders,
  selectedModel,
  handleModelChange,
  rootPath, // Add rootPath prop
  setRootPath // Add setRootPath prop
}) {
  useEffect(() => {
    fetchFolders();
    fetchRootPath();
  }, []);

  const fetchRootPath = async () => {
    try {
      const response = await axios.get(`${config.backendUrl}/root_path`);
      setRootPath(response.data.rootPath);
    } catch (error) {
      console.error('Error fetching root path:', error);
    }
  };

  const fetchFolderTree = async (folderPath) => {
    try {
      const response = await axios.get(`${config.backendUrl}/folder_tree`, { params: { path: folderPath } });
      setFolderTree(response.data);
    } catch (error) {
      console.error('Error fetching folder tree:', error);
    }
  };

  const handleFolderChange = (e) => {
    const folderPath = e.target.value;
    setSelectedFolder(folderPath);
    if (folderPath) {
      fetchFolderTree(folderPath);
    }
  };

  const handleCheckChange = async (node, isChecked) => {
    const updateCheckStatus = (node, status) => {
      node.isChecked = status;
      if (node.children) {
        node.children.forEach((child) => updateCheckStatus(child, status));
      }
    };

    const updateTree = (nodeToUpdate) => {
      if (nodeToUpdate.path === node.path) {
        updateCheckStatus(nodeToUpdate, isChecked);
      } else if (nodeToUpdate.children) {
        nodeToUpdate.children = nodeToUpdate.children.map((child) => updateTree(child));
      }
      return nodeToUpdate;
    };

    const gatherSelectedFiles = (node) => {
      let files = [];
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

    const updateSelectedFiles = async () => {
      const selectedFiles = gatherSelectedFiles(folderTree);
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

    setFolderTree(updateTree({ ...folderTree }));
    await updateSelectedFiles();
  };

  return (
    <div className="w-1/4 p-2 overflow-y-auto">
      <FolderSelector
        folders={folders}
        folderTree={folderTree}
        handleFolderChange={handleFolderChange}
        fetchFolders={fetchFolders}
        selectedFolder={selectedFolder}
        handleCheckChange={handleCheckChange}
        selectedModel={selectedModel}
        handleModelChange={handleModelChange}
        rootPath={rootPath} // Pass rootPath prop
      />
    </div>
  );
}

export default FolderHandler;
