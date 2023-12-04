document.addEventListener("DOMContentLoaded", function () {
    class Node {
        constructor(value) {
            this.value = value;
            this.left = null;
            this.right = null;
        }
    }

    class BST {
        constructor() {
            this.root = null;
        }

        insert(value) {
            const newNode = new Node(value);

            if (!this.root) {
                this.root = newNode;
            } else {
                this.insertNode(this.root, newNode);
            }

            this.visualize();
        }

        insertNode(node, newNode) {
            if (newNode.value < node.value) {
                if (!node.left) {
                    node.left = newNode;
                } else {
                    this.insertNode(node.left, newNode);
                }
            } else {
                if (!node.right) {
                    node.right = newNode;
                } else {
                    this.insertNode(node.right, newNode);
                }
            }
        }

        getHeight(node) {
            if (!node) return 0;
            return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
        }
        visualize() {
            const treeContainer = document.getElementById("tree-container");
            const height = this.getHeight(this.root);
            treeContainer.style.height = height * 120 + "px";
            treeContainer.innerHTML = "";
            this.visualizeNode(
                this.root,
                treeContainer.clientWidth / 2,
                20,
                200,
                treeContainer
            );
        }

        visualizeNode(node, x, y, offsetX, container) {
            if (!node) return;

            const nodeElement = document.createElement("div");
            nodeElement.className = "node";
            nodeElement.style.left = x - 20 + "px";
            nodeElement.style.top = y + 25 + "px";
            nodeElement.textContent = node.value;

            container.appendChild(nodeElement);

            const horizontalGap = 50;

            if (node.left) {
                const leftX = x - offsetX - horizontalGap / 2;
                const leftY = y + 120;
                this.drawConnection(x, y + 25, leftX, leftY, container);
                this.visualizeNode(node.left, leftX, leftY, offsetX / 2, container);
            }

            if (node.right) {
                const rightX = x + offsetX + horizontalGap / 2;
                const rightY = y + 120;
                this.drawConnection(x, y + 25, rightX, rightY, container);
                this.visualizeNode(node.right, rightX, rightY, offsetX / 2, container);
            }
        }

        drawConnection(x1, y1, x2, y2, container) {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

            svg.setAttributeNS(null, "width", "100%");
            svg.setAttributeNS(null, "height", "100%");
            svg.style.position = "absolute";
            svg.style.pointerEvents = "none";

            y2 = Math.min(y2, parseFloat(container.style.height) - 20);

            line.setAttributeNS(null, "x1", x1);
            line.setAttributeNS(null, "y1", y1 + 35);
            line.setAttributeNS(null, "x2", x2);
            line.setAttributeNS(null, "y2", y2 + 35);
            line.style.stroke = "black";
            line.style.strokeWidth = "2px";

            svg.appendChild(line);
            container.appendChild(svg);
        }
        

        insertNodePrompt() {
            const valueInput = document.getElementById("nodeValue");
            const value = parseInt(valueInput.value, 10);

            if (!isNaN(value)) {
                this.insert(value);
                valueInput.value = '';
            }
        }

        deleteNodePrompt() {
            const valueInput = document.getElementById("nodeValue");
            const value = parseInt(valueInput.value, 10);
        
            if (!isNaN(value)) {
                this.delete(value);
                this.visualize();
                valueInput.value = '';
            }
        }
        

        delete(value) {
            this.root = this.deleteNode(this.root, value);
        }

        deleteNode(root, value) {
            if (!root) {
                return null;
            }

            if (value < root.value) {
                root.left = this.deleteNode(root.left, value);
            } else if (value > root.value) {
                root.right = this.deleteNode(root.right, value);
            } else {
                if (!root.left) {
                    return root.right;
                } else if (!root.right) {
                    return root.left;
                }

                root.value = this.getMinValue(root.right);
                root.right = this.deleteNode(root.right, root.value);
            }

            return root;
        }

        getMinValue(node) {
            let current = node;
            while (current.left) {
                current = current.left;
            }
            return current.value;
        }
    }

    const bst = new BST();
    bst.visualize();

    document
        .getElementById("insertBtn")
        .addEventListener("click", () => bst.insertNodePrompt());
    document
        .getElementById("deleteBtn")
        .addEventListener("click", () => bst.deleteNodePrompt());
});
