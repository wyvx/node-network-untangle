# Node Network Untangle
## An experiment with steering behaviors to untangle a tangled node network.

A tangle is defined as two connections (lines) crossing. The algorithm deterministically chooses which line to work on. And from that line, which node is the **target** and which the **mover**.

In this implementation, each node has an id, so the deterministic selection is done using that. From a tangle, the line containing the node with the highest id is worked on. And the node with the highest id is the **mover**. It's important to be deterministic or it can bounce all over if a new node is chosen every frame.

When a tangled node pair (a **target** and a **mover**) is identified, the **target** is temporarily free of other behaviors and stays put. While the **mover** and all its children (except the **target**) are temporatily free of other behaviors except to seek the **target**. As soon as the tangle is resolved, other behaviors resume and nodes repel and arrange themselves.
