import React from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import FolderTree from './FolderTree';

const FolderSelector = ({
  folders,
  folderTree,
  handleFolderChange,
  fetchFolders,
  selectedFolder,
  handleCheckChange,
  selectedModel,
  handleModelChange,
  rootPath,
  fetchFolderTreeWithCheckedState,
  toggleCollapse,
  collapsedFolders
}) => {
  return (
    <div className="bg-gray-100 p-4 overflow-y-auto">
      <div className="flex mb-4">
        <select value={selectedModel} onChange={handleModelChange} className="w-full p-2 border">
          <option value="gpt-4o-mini">GPT-4o-mini</option>
          <option value="gpt-4o">GPT-4o</option>
        </select>
      </div>
      <div className="flex mb-4">
        <select value={selectedFolder} onChange={handleFolderChange} className="w-full p-2 border">
          <option value="">Select a folder</option>
          {folders.map((folder) => (
            <option key={folder} value={folder}>
              {folder}
            </option>
          ))}
        </select>
        <button onClick={fetchFolders} className="ml-2 text-blue-500">
          <AiOutlineReload size={24} />
        </button>
        <button onClick={() => fetchFolderTreeWithCheckedState(selectedFolder, collapsedFolders)} className="ml-2 text-green-500">
          <AiOutlineReload size={24} />
        </button>
      </div>
      {folderTree && (
        <FolderTree
          node={folderTree}
          handleCheckChange={handleCheckChange}
          toggleCollapse={toggleCollapse}
          collapsedFolders={collapsedFolders}
        />
      )}
    </div>
  );
};

export default FolderSelector;
