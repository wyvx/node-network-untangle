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
* @fileoverview Experiment with untangling a node network.
* 
* @author Luis Mejia <lmejia@gmail.com>
* 
* @requires EXTERNAL:@link{https://p5js.org p5.js}
* @requires p5-ext.js
* @requires network-node.js
*/
'use strict';

class App {

    constructor() {
        this.maxNodes = 90;
        this.spawnInterval = 1000 / 2; // 0.5 secs.
        this.lastNodeTime = 0;
        this.nodes = [];
        this.connectionPairs = [];
        this.fence = []; // So nodes don't steer away from the screen.
    }

    onSetup() {
        this.lastNodeTime = millis();
        this.fence = [
            createVector(40, 40),
            createVector(width - 40, 40),
            createVector(width - 40, height - 40),
            createVector(40, height - 40)
        ];
    }

    addNode() {
        let node;
        if ((this.nodes.length < 1) || (random() < 0.1)) {
            const position = this.randomPosition();
            node = new Node(position);
        } else {
            const r = Math.floor(Math.random() * this.nodes.length);
            const other = this.nodes[r];
            const position = this.positionVariation(other.position);
            // let position = this.randomPosition();
            node = new Node(position);
            node.connect(other);
        }
        this.nodes.push(node);
        this.calculateConnectionPairsFromNodes();
    }

    randomPosition() {
        return createVector(random(width * 0.1, width * 0.9), random(height * 0.1, height * 0.9));
    }

    positionVariation(vector) {
        return p5.Vector.add(vector, createVector(random(2) - 1, random(2) - 1));
    }

    calculateConnectionPairsFromNodes() {
        this.connectionPairs = [];
        const known = [];
        this.nodes.forEach(node => {
            node.connections.forEach(connection => {
                if (!known.includes(connection)) {
                    this.connectionPairs.push([node, connection]);
                }
            });
            known.push(node);
        });
    }

    onUpdate() {
        // Create new nodes.
        const now = millis();
        if ((this.nodes.length < this.maxNodes) && ((now - this.lastNodeTime) >= this.spawnInterval)) {
            this.lastNodeTime = now;
            this.addNode();
        }
        // Gather tangled children.
        function children(node, parent) {
            let childNodes = [];
            node.connections.forEach(connection => {
                if (connection != parent) {
                    childNodes.push(connection);
                    childNodes = childNodes.concat(children(connection, node));
                }
            });
            return childNodes;
        }
        const untanglePair = this.untangle();
        let movers;
        if (untanglePair != null) {
            movers = children(untanglePair.mover, untanglePair.target);
            movers.push(untanglePair.mover);
        }
        // Update nodes.
        this.nodes.forEach(node => {
            const vectors = [node.contain(this.fence)];
            // Untangle target is temporarily not affected by other behaviors.
            if ((untanglePair == null) || (node != untanglePair.target)) {
                if ((untanglePair != null) && movers.includes(node)) {
                    // Untangle movers are temporarily not affected by other behaviors.
                    // Instead, they seek the target.
                    vectors.push(node.seek(untanglePair.target.position));
                } else {
                    vectors.push(node.crowd());
                    vectors.push(node.separate(this.nodes));
                }
            }
            const sum = createVector(0, 0);
            let count = 0;
            vectors.forEach(v => {
                if (v.mag() > 0) {
                    sum.add(v);
                    ++count;
                }
            });
            if (count > 0) {
                sum.div(count);
                node.steer(sum);
            }
            node.update();
        });
    }

    untangle() {
        for (let i = 0; i < (this.connectionPairs.length - 1); ++i) {
            const pair1 = this.connectionPairs[i];
            const p1 = pair1[0].position;
            const p2 = pair1[1].position;
            for (let j = i + 1; j < this.connectionPairs.length; ++j) {
                const pair2 = this.connectionPairs[j];
                if ((pair1[0] == pair2[0]) || (pair1[0] == pair2[1]) ||
                    (pair1[1] == pair2[0]) || (pair1[1] == pair2[1])) {
                    continue;
                }
                const q1 = pair2[0].position;
                const q2 = pair2[1].position;
                if (p5ext.linesIntersect(p1, p2, q1, q2)) {
                    const pair1LargestId = Math.max(pair1[0].id, pair1[1].id);
                    const pair2LargestId = Math.max(pair2[0].id, pair2[1].id);
                    const pairToUntangle = pair1LargestId > pair2LargestId ? pair1 : pair2;
                    const mover = pairToUntangle[0].id > pairToUntangle[1].id ? pairToUntangle[0] : pairToUntangle[1];
                    const target = pairToUntangle[0].id < pairToUntangle[1].id ? pairToUntangle[0] : pairToUntangle[1];
                    return {
                        mover: mover,
                        target: target
                    };
                }
            }
        }
        return null;
    }

    onDraw() {
        background(0);
        // Draw lines.
        push();
        stroke('#45dfe3c0');
        strokeWeight(0.3);
        this.connectionPairs.forEach(pair => {
            const p1 = pair[0].position;
            const p2 = pair[1].position;
            line(p1.x, p1.y, p2.x, p2.y);
        });
        pop();
        // Draw nodes.
        this.nodes.forEach(node => node.draw(0));
    }
}
