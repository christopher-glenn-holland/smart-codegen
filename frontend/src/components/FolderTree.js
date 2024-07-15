import React from 'react';
import { AiOutlineRight, AiOutlineDown } from 'react-icons/ai';

const FolderTree = ({ node, handleCheckChange, toggleCollapse, collapsedFolders }) => {
  const renderTree = (node) => (
    <div key={node.path} className="ml-4">
      <div className="flex items-center">
        {node.isDirectory && (
          <span onClick={() => toggleCollapse(node.path)} className="cursor-pointer">
            {collapsedFolders[node.path] ? <AiOutlineRight /> : <AiOutlineDown />}
          </span>
        )}
        <input
          type="checkbox"
          id={node.path}
          checked={node.isChecked || false}
          onChange={(e) => handleCheckChange(node, e.target.checked)}
          className="ml-2"
        />
        <label
          htmlFor={node.path}
          className={`ml-2 ${node.isDirectory ? 'text-black-600 font-bold' : 'text-black-600'}`}
        >
          {node.name}
        </label>
      </div>
      {node.children && node.children.length > 0 && !collapsedFolders[node.path] && (
        <div className="ml-4">{node.children.map((child) => renderTree(child))}</div>
      )}
    </div>
  );

  return <div className="overflow-auto">{renderTree(node)}</div>;
};

export default FolderTree;
