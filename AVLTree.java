import java.util.*;
import java.util.function.Function;

class AVLNode {
    int data;
    int height;
    AVLNode left, right;

    public AVLNode(int data) {
        this.data = data;
        this.height = 1;
    }
}

class AVLTree {
    AVLNode insert(AVLNode root, int value) {
        if (root == null) {
            return new AVLNode(value);
        }

        if (value < root.data) {
            root.left = insert(root.left, value);
        } else if (value > root.data) {
            root.right = insert(root.right, value);
        } else {
            return root;
        }

        updateHeight(root);

        int balance = getBalance(root);

        if (balance > 1 && value < root.left.data) {
            return rightRotate(root);
        }
        if (balance < -1 && value > root.right.data) {
            return leftRotate(root);
        }
        if (balance > 1 && value > root.left.data) {
            root.left = leftRotate(root.left);
            return rightRotate(root);
        }
        if (balance < -1 && value < root.right.data) {
            root.right = rightRotate(root.right);
            return leftRotate(root);
        }

        return root;
    }

    void updateHeight(AVLNode node) {
        node.height = 1 + Math.max(height(node.left), height(node.right));
    }

    int height(AVLNode node) {
        return (node == null) ? 0 : node.height;
    }

    int getBalance(AVLNode node) {
        return (node == null) ? 0 : height(node.left) - height(node.right);
    }

    AVLNode rightRotate(AVLNode y) {
        AVLNode x = y.left;
        AVLNode T2 = x.right;

        x.right = y;
        y.left = T2;

        updateHeight(y);
        updateHeight(x);

        return x;
    }

    AVLNode leftRotate(AVLNode x) {
        AVLNode y = x.right;
        AVLNode T2 = y.left;

        y.left = x;
        x.right = T2;

        updateHeight(x);
        updateHeight(y);

        return y;
    }

    void printPreorder(AVLNode root) {
        if (root == null) return;
        System.out.print(root.data + " ");
        printPreorder(root.left);
        printPreorder(root.right);
    }

    void printInorder(AVLNode root) {
        if (root == null) return;
        printInorder(root.left);
        System.out.print(root.data + " ");
        printInorder(root.right);
    }
}

class TreePrinter<T> {
    private final Function<T, String> getLabel;
    private final Function<T, T> getLeft;
    private final Function<T, T> getRight;

    public TreePrinter(Function<T, String> getLabel, Function<T, T> getLeft, Function<T, T> getRight) {
        this.getLabel = getLabel;
        this.getLeft = getLeft;
        this.getRight = getRight;
    }

    public void printTree(T root) {
        if (root == null) {
            System.out.println("(empty)");
            return;
        }
        int maxLevel = maxLevel(root);
        printNodeInternal(Collections.singletonList(root), 1, maxLevel);
    }

    // Pretty-print (upright) binary tree using / and \ connectors.
    // This version prints exactly ONE connector row per level (like your screenshot).
    private void printNodeInternal(List<T> nodes, int level, int maxLevel) {
        if (nodes.isEmpty() || isAllElementsNull(nodes)) return;

        int floor = maxLevel - level;
        int firstSpaces = (int) Math.pow(2, floor) - 1;
        int betweenSpaces = (int) Math.pow(2, floor + 1) - 1;

        printWhitespaces(firstSpaces);

        List<T> newNodes = new ArrayList<>();
        for (T node : nodes) {
            if (node != null) {
                System.out.print(getLabel.apply(node));
                newNodes.add(getLeft.apply(node));
                newNodes.add(getRight.apply(node));
            } else {
                System.out.print(" ");
                newNodes.add(null);
                newNodes.add(null);
            }

            printWhitespaces(betweenSpaces);
        }
        System.out.println();

        // If there are no children, stop (avoid printing an extra blank connector row).
        if (isAllElementsNull(newNodes)) return;

        // Connector row: / and \ directly above children.
        printWhitespaces(Math.max(0, firstSpaces - 1));
        for (T node : nodes) {
            if (node == null) {
                printWhitespaces(betweenSpaces + 2);
                continue;
            }

            System.out.print(getLeft.apply(node) != null ? "/" : " ");
            printWhitespaces(1);
            System.out.print(getRight.apply(node) != null ? "\\" : " ");
            printWhitespaces(Math.max(0, betweenSpaces - 1));
        }
        System.out.println();

        printNodeInternal(newNodes, level + 1, maxLevel);
    }

    private int maxLevel(T node) {
        if (node == null) return 0;
        return 1 + Math.max(maxLevel(getLeft.apply(node)), maxLevel(getRight.apply(node)));
    }

    private int maxLabelWidth(T node) {
        if (node == null) return 0;
        int here = getLabel.apply(node).length();
        return Math.max(here, Math.max(maxLabelWidth(getLeft.apply(node)), maxLabelWidth(getRight.apply(node))));
    }

    private boolean isAllElementsNull(List<T> list) {
        for (T obj : list) {
            if (obj != null) return false;
        }
        return true;
    }

    private void printWhitespaces(int count) {
        if (count <= 0) return;
        System.out.print(" ".repeat(count));
    }
}

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        AVLTree tree = new AVLTree();
        AVLNode root = null;

        System.out.println("Enter the number of elements:");
        int n = sc.nextInt();

        TreePrinter<AVLNode> tp = new TreePrinter<>(node -> "" + node.data, node -> node.left, node -> node.right);

        System.out.println("Enter " + n + " elements:");
        for (int i = 0; i < n; i++) {
            int value = sc.nextInt();
            root = tree.insert(root, value);

            tp.printTree(root);
        }
    }
}