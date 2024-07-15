export const updateCheckStatus = (node, status) => {
    node.isChecked = status;
    if (node.children) {
      node.children.forEach((child) => updateCheckStatus(child, status));
    }
  };
  
  export const updateTree = (nodeToUpdate, node, isChecked) => {
    if (nodeToUpdate.path === node.path) {
      updateCheckStatus(nodeToUpdate, isChecked);
    } else if (nodeToUpdate.children) {
      nodeToUpdate.children = nodeToUpdate.children.map((child) => updateTree(child, node, isChecked));
    }
    return nodeToUpdate;
  };
  
  export const gatherSelectedFiles = (node) => {
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
  