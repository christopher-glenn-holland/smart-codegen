import React, { useEffect, useState } from 'react';
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
  rootPath,
  setRootPath
}) {
  const [collapsedFolders, setCollapsedFolders] = useState({});

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

  const fetchFolderTreeWithCheckedState = async (folderPath, collapsedFolders) => {
    const checkedPaths = gatherCheckedPaths(folderTree);
    try {
      const response = await axios.get(`${config.backendUrl}/folder_tree`, { params: { path: folderPath } });
      const newTree = restoreCheckedState(response.data, checkedPaths, collapsedFolders);
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

  const restoreCheckedState = (node, checkedPaths, collapsedFolders) => {
    if (!node) return node;
    node.isChecked = checkedPaths.includes(node.path);
    node.isCollapsed = collapsedFolders[node.path] || false;
    if (node.children) {
      node.children = node.children.map((child) => restoreCheckedState(child, checkedPaths, collapsedFolders));
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

  const handleFolderChange = (e) => {
    const folderPath = e.target.value;
    setSelectedFolder(folderPath);
    if (folderPath) {
      fetchFolderTreeWithCheckedState(folderPath, collapsedFolders);
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
        nodeToUpdate.children = nodeToUpdate.children.map((child) => updateTree(child, node, isChecked));
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

  const toggleCollapse = (path) => {
    setCollapsedFolders((prevState) => ({
      ...prevState,
      [path]: !prevState[path],
    }));
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
        rootPath={rootPath}
        fetchFolderTreeWithCheckedState={fetchFolderTreeWithCheckedState}
        toggleCollapse={toggleCollapse}
        collapsedFolders={collapsedFolders}
      />
    </div>
  );
}

export default FolderHandler;
