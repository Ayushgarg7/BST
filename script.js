document.addEventListener("DOMContentLoaded", function () {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    class Node {
        constructor(value) {
            this.value = value;
            this.left = null;
            this.right = null;
            // Create DOM element for this node
            this.element = document.createElement("div");
            this.element.className = "node";
            this.element.textContent = value;
            // Initial position (off-screen or at root)
            this.element.style.left = "50%";
            this.element.style.top = "-50px";
            document.getElementById("tree-container").appendChild(this.element);
        }
    }

    class BST {
        constructor() {
            this.root = null;
            this.isAnimating = false;
        }

        getSpeed() {
            return parseInt(document.getElementById("speedSlider").value, 10);
        }

        setStatus(msg, isError = false) {
            const status = document.getElementById("statusMessage");
            status.textContent = msg;
            status.className = "status-message" + (isError ? " status-error" : "");
        }

        async insert(value) {
            if (this.isAnimating) return;
            this.isAnimating = true;

            if (!this.root) {
                this.setStatus(`Inserting root node: ${value}`);
                this.root = new Node(value);
                this.updateLayout();
                this.isAnimating = false;
                return;
            }

            this.setStatus(`Searching for position to insert ${value}...`);
            let current = this.root;
            
            while (true) {
                // Highlight current node
                current.element.classList.add("highlight");
                await sleep(this.getSpeed());

                if (value === current.value) {
                    this.setStatus(`Error: Node ${value} already exists in the BST!`, true);
                    current.element.classList.remove("highlight");
                    current.element.classList.add("delete"); // flash red
                    await sleep(this.getSpeed());
                    current.element.classList.remove("delete");
                    this.isAnimating = false;
                    return;
                }

                current.element.classList.remove("highlight");

                if (value < current.value) {
                    if (!current.left) {
                        this.setStatus(`Inserting ${value} to the left of ${current.value}`);
                        current.left = new Node(value);
                        // Start animation from parent position
                        current.left.element.style.left = current.element.style.left;
                        current.left.element.style.top = current.element.style.top;
                        break;
                    }
                    current = current.left;
                } else {
                    if (!current.right) {
                        this.setStatus(`Inserting ${value} to the right of ${current.value}`);
                        current.right = new Node(value);
                        // Start animation from parent position
                        current.right.element.style.left = current.element.style.left;
                        current.right.element.style.top = current.element.style.top;
                        break;
                    }
                    current = current.right;
                }
            }

            this.updateLayout();
            await sleep(this.getSpeed()); // Wait for glide
            this.isAnimating = false;
            this.setStatus(`Successfully inserted ${value}.`);
        }

        async delete(value) {
            if (this.isAnimating || !this.root) return;
            this.isAnimating = true;
            this.setStatus(`Searching for node ${value} to delete...`);

            // Find the node to animate
            let current = this.root;
            let parent = null;
            let found = false;

            while (current) {
                current.element.classList.add("highlight");
                await sleep(this.getSpeed());

                if (value === current.value) {
                    found = true;
                    current.element.classList.remove("highlight");
                    break;
                }

                current.element.classList.remove("highlight");
                parent = current;
                if (value < current.value) current = current.left;
                else current = current.right;
            }

            if (!found) {
                this.setStatus(`Error: Node ${value} not found in the BST.`, true);
                this.isAnimating = false;
                return;
            }

            this.setStatus(`Node ${value} found. Deleting...`);
            current.element.classList.add("delete");
            await sleep(500); // Wait for shrink animation

            // Remove from DOM
            if (current.element.parentNode) {
                current.element.parentNode.removeChild(current.element);
            }

            // Perform logical deletion
            this.root = this.deleteNodeLogic(this.root, value);

            this.updateLayout();
            await sleep(this.getSpeed());
            this.isAnimating = false;
            this.setStatus(`Successfully deleted ${value}.`);
        }

        deleteNodeLogic(root, value) {
            if (!root) return null;

            if (value < root.value) {
                root.left = this.deleteNodeLogic(root.left, value);
            } else if (value > root.value) {
                root.right = this.deleteNodeLogic(root.right, value);
            } else {
                if (!root.left) return root.right;
                else if (!root.right) return root.left;

                // Node with two children: Get inorder successor
                let minValueNode = this.getMinValueNode(root.right);
                
                // We swap values logically, but we must swap the physical DOM element
                // to maintain animation continuity. 
                // Alternatively, we just swap the textContent and delete the successor.
                let tempValue = root.value;
                root.value = minValueNode.value;
                root.element.textContent = root.value;
                
                // Restore the element's appearance (it was marked deleted)
                root.element.classList.remove("delete");
                
                // Now delete the inorder successor physically
                let successorElement = minValueNode.element;
                successorElement.classList.add("delete");
                setTimeout(() => {
                    if (successorElement.parentNode) {
                        successorElement.parentNode.removeChild(successorElement);
                    }
                }, 500);

                root.right = this.deleteNodeLogic(root.right, minValueNode.value);
            }
            return root;
        }

        getMinValueNode(node) {
            let current = node;
            while (current.left) {
                current = current.left;
            }
            return current;
        }

        getHeight(node) {
            if (!node) return 0;
            return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
        }

        updateLayout() {
            const svgCanvas = document.getElementById("svg-canvas");
            svgCanvas.innerHTML = ""; // Clear existing lines
            
            if (!this.root) return;

            const container = document.getElementById("tree-container");
            const height = this.getHeight(this.root);
            
            // Adjust container height based on tree depth
            container.style.height = Math.max(height * 100 + 100, container.clientHeight) + "px";

            // Calculate positions and update DOM
            this.calculatePositions(this.root, container.clientWidth / 2, 50, container.clientWidth / 4, svgCanvas);
        }

        calculatePositions(node, x, y, offsetX, svgCanvas) {
            if (!node) return;

            // Move node to new coordinates via CSS transition
            node.element.style.left = x + "px";
            node.element.style.top = y + "px";

            const verticalGap = 80;

            if (node.left) {
                const leftX = x - offsetX;
                const leftY = y + verticalGap;
                
                // We use setTimeout to draw lines AFTER nodes finish transitioning,
                // or we draw them immediately and let them snap.
                // For a highly polished look, drawing immediately is acceptable.
                this.drawLine(x, y, leftX, leftY, svgCanvas);
                this.calculatePositions(node.left, leftX, leftY, offsetX / 2, svgCanvas);
            }

            if (node.right) {
                const rightX = x + offsetX;
                const rightY = y + verticalGap;
                this.drawLine(x, y, rightX, rightY, svgCanvas);
                this.calculatePositions(node.right, rightX, rightY, offsetX / 2, svgCanvas);
            }
        }

        drawLine(x1, y1, x2, y2, svgCanvas) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x1);
            line.setAttribute("y1", y1);
            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2);
            svgCanvas.appendChild(line);
        }
    }

    const bst = new BST();

    // Handle Window Resize
    window.addEventListener("resize", () => {
        if (!bst.isAnimating) {
            bst.updateLayout();
        }
    });

    // Input handlers
    const insertBtn = document.getElementById("insertBtn");
    const deleteBtn = document.getElementById("deleteBtn");
    const nodeValueInput = document.getElementById("nodeValue");

    const handleInsert = async () => {
        const val = parseInt(nodeValueInput.value, 10);
        if (!isNaN(val)) {
            await bst.insert(val);
            nodeValueInput.value = '';
            nodeValueInput.focus();
        }
    };

    const handleDelete = async () => {
        const val = parseInt(nodeValueInput.value, 10);
        if (!isNaN(val)) {
            await bst.delete(val);
            nodeValueInput.value = '';
            nodeValueInput.focus();
        }
    };

    insertBtn.addEventListener("click", handleInsert);
    deleteBtn.addEventListener("click", handleDelete);
    
    nodeValueInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            handleInsert();
        }
    });
});
