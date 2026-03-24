const canvas = document.getElementById("treeCanvas");
const ctx = canvas.getContext("2d");

class Node {
  constructor(value, x = 0, y = 0) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
  }
}

class AVLTree {
  constructor() {
    this.root = null;
  }

  height(node) {
    return node ? node.height : 0;
  }

  getBalance(node) {
    return node ? this.height(node.left) - this.height(node.right) : 0;
  }

  rotateRight(y) {
    const x = y.left;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    y.height = 1 + Math.max(this.height(y.left), this.height(y.right));
    x.height = 1 + Math.max(this.height(x.left), this.height(x.right));
    return x;
  }

  rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    x.height = 1 + Math.max(this.height(x.left), this.height(x.right));
    y.height = 1 + Math.max(this.height(y.left), this.height(y.right));
    return y;
  }

  insert(node, value) {
    if (!node) return new Node(value);
    if (value < node.value) node.left = this.insert(node.left, value);
    else if (value > node.value) node.right = this.insert(node.right, value);
    else return node;

    node.height = 1 + Math.max(this.height(node.left), this.height(node.right));

    const balance = this.getBalance(node);

    // Left Left
    if (balance > 1 && value < node.left.value) return this.rotateRight(node);
    // Right Right
    if (balance < -1 && value > node.right.value) return this.rotateLeft(node);
    // Left Right
    if (balance > 1 && value > node.left.value) {
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }
    // Right Left
    if (balance < -1 && value < node.right.value) {
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }

    return node;
  }

  add(value) {
    this.root = this.insert(this.root, value);
    this.updatePositions();
  }

  updatePositions() {
    const setCoords = (node, x, y, gap) => {
      if (!node) return;
      node.targetX = x;
      node.targetY = y;
      setCoords(node.left, x - gap, y + 90, gap / 1.7);
      setCoords(node.right, x + gap, y + 90, gap / 1.7);
    };
    setCoords(this.root, canvas.width / 2, 80, 180);
  }

  delete(node, value) {
    if (!node) {
      logMessage("Value not found in the tree.");
      return node;
    }

    if (value < node.value) {
      logMessage(`Going left to delete value: ${value}`);
      node.left = this.delete(node.left, value);
    } else if (value > node.value) {
      logMessage(`Going right to delete value: ${value}`);
      node.right = this.delete(node.right, value);
    } else {
      logMessage(`Found node to delete: ${node.value}`);

      // Node with one or no child
      if (!node.left || !node.right) {
        const temp = node.left ? node.left : node.right;

        if (!temp) {
          logMessage("Node has no children, deleting directly.");
          node = null;
        } else {
          logMessage("Node has one child, replacing with child.");
          node = temp;
        }
      } else {
        // Node with two children
        const temp = this.getMinValueNode(node.right);
        logMessage(`Node has two children, replacing with inorder successor: ${temp.value}`);
        node.value = temp.value;
        node.right = this.delete(node.right, temp.value);
      }
    }

    if (!node) return node;

    // Update height
    node.height = 1 + Math.max(this.height(node.left), this.height(node.right));

    // Rebalance the tree
    const balance = this.getBalance(node);

    // Left Left Case
    if (balance > 1 && this.getBalance(node.left) >= 0) {
      logMessage("Performing right rotation.");
      return this.rotateRight(node);
    }

    // Left Right Case
    if (balance > 1 && this.getBalance(node.left) < 0) {
      logMessage("Performing left-right rotation.");
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }

    // Right Right Case
    if (balance < -1 && this.getBalance(node.right) <= 0) {
      logMessage("Performing left rotation.");
      return this.rotateLeft(node);
    }

    // Right Left Case
    if (balance < -1 && this.getBalance(node.right) > 0) {
      logMessage("Performing right-left rotation.");
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }

    return node;
  }

  getMinValueNode(node) {
    logMessage(`Finding inorder successor starting from node: ${node.value}`);
    while (node.left) {
      logMessage(`Moving left to find inorder successor: ${node.left.value}`);
      node = node.left;
    }
    logMessage(`Inorder successor found: ${node.value}`);
    return node;
  }

  remove(value) {
    logMessage(`Removing value: ${value}`);
    this.root = this.delete(this.root, value);
    if (this.root) {
      logMessage("Tree updated after deletion.");
      this.updatePositions();
      this.drawTree();
      logMessage("Tree redrawn on canvas.");
    } else {
      logMessage("Tree is now empty.");
      const canvas = document.getElementById("treeCanvas");
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
}

const tree = new AVLTree();

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTree(tree.root);
  requestAnimationFrame(animate);
}

function drawTree(node) {
  if (!node) return;

  // smooth move
  node.x += (node.targetX - node.x) * 0.1;
  node.y += (node.targetY - node.y) * 0.1;

  // draw edges first
  if (node.left) {
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.lineTo(node.left.x, node.left.y);
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  if (node.right) {
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.lineTo(node.right.x, node.right.y);
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // recursive call
  drawTree(node.left);
  drawTree(node.right);

  // draw node circle
  ctx.beginPath();
  ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
  ctx.fillStyle = "#0077b6";
  ctx.fill();
  ctx.strokeStyle = "#023e8a";
  ctx.lineWidth = 2;
  ctx.stroke();

  // draw text inside node
  ctx.fillStyle = "white";
  ctx.font = "16px Segoe UI";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(node.value, node.x, node.y);
}

animate();

document.getElementById("insertBtn").addEventListener("click", () => {
  const value = parseInt(document.getElementById("value").value);
  if (!isNaN(value)) {
    tree.add(value);
    document.getElementById("value").value = "";
  }
});

document.getElementById("clearBtn").addEventListener("click", () => {
  tree.root = null;
});

document.getElementById("deleteBtn").addEventListener("click", () => {
  const value = parseInt(document.getElementById("value").value);
  if (!isNaN(value)) {
    logMessage(`Attempting to delete value: ${value}`);
    tree.remove(value);
    logMessage("Delete operation completed. Tree updated.");
  } else {
    logMessage("Invalid input. Please enter a valid number to delete.");
  }
});

function logMessage(message) {
  console.log(message);
}