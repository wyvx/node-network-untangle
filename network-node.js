/**
 * @license
 * Copyright 2019 Luis Mejia
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 /**
 * @fileoverview Networked node that knows about other nodes and connections between them.
 * 
 * @author Luis Mejia <lmejia@gmail.com>
 * 
 * @requires autonomous-agent.js
 */
'use strict';

let _nodeIdCounter = 0;
function generateNodeId() {
    ++_nodeIdCounter;
    return _nodeIdCounter;
}

class Node extends AutonomousAgent {

    constructor(position) {
        super(position);
        this.id = generateNodeId();
        this.connections = [];
    }

    connect(node) {
        if (node == null) {
            return;
        }
        this.connections.push(node);
        node.connections.push(this);
    }

    disconnect(node) {
        if (node == null) {
            return;
        }
        node.removeConnection(this);
        this.removeConnection(node);
    }

    removeConnection(node) {
        if (node == null) {
            return;
        }
        for (let i = 0; i < this.connections.length; ++i) {
            if (this.connections[i] == node) {
                this.connections.splice(i, 1);
                return;
            }
        }
    }

    crowd() {
        return this.groupBehavior(this.connections, this.stalk);
    }

    separate(nodes) {
        const nonConnectedNodes = nodes.filter(node => !this.connections.includes(node));
        const nonConnectedVector = this.groupBehavior(nonConnectedNodes, this.reject);
        const connectedVector = this.groupBehavior(this.connections, this.reject, this.stalkDistance.min);
        const totalNodes = nonConnectedNodes.length + this.connections.length;
        nonConnectedVector.mult(nonConnectedNodes.length / totalNodes);
        connectedVector.mult(this.connections.length / totalNodes);
        return p5.Vector.add(nonConnectedVector, connectedVector);
    }

    draw() {
        push();
        fill('#45dfe340');
        stroke('#f0f0f0ff');
        strokeWeight(0.75);
        ellipse(this.position.x, this.position.y, 20, 20);
        pop();
    }
}
