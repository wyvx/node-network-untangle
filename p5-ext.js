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
 * @fileoverview Utility functions that extend p5.js.
 * 
 * @author Luis Mejia <lmejia@gmail.com>
 * 
 * @requires EXTERNAL:@link{https://p5js.org p5.js}
 */
'use strict';

const p5ext = {};
(function () {

    const this_ = this;

    /**
     * Shows the FPS on the bottom right corner of the viewport.
     * @param {color} [color = 255] Text color.
     */
    this.showFps = function (color = 255) {
        push();
        let fps = frameRate();
        fill(color);
        stroke(0);
        text("FPS: " + fps.toFixed(1), width - 100, height - 10);
        pop();
    }

    /**
     * Determines if two lines intersect (or are colinear).
     * @param {p5.Vector} p1 Line 1 point 1.
     * @param {p5.Vector} p2 Line 1 point 2.
     * @param {p5.Vector} q1 Line 2 point 1.
     * @param {p5.Vector} q2 Line 2 point 2.
     * 
     * @returns {boolean} True if the lines intersect.
     */
    this.linesIntersect = function (p1, p2, q1, q2) {
        function orientation(a, b, c) {
            let v = ((b.y - a.y) * (c.x - b.x)) - ((b.x - a.x) * (c.y - b.y));
            if (v > 0) {
                return 1;
            }
            if (v < 0) {
                return -1;
            }
            return 0;
        }
        function isOnSegment(p, p1, p2) {
            return (p.x <= Math.max(p1.x, p2.x)) && (p.x >= Math.min(p1.x, p2.x)) &&
                (p.y <= Math.max(p1.y, p2.y)) && (p.y >= Math.min(p1.y, p2.y));
        }
        let dir1 = orientation(p1, p2, q1);
        let dir2 = orientation(p1, p2, q2);
        let dir3 = orientation(q1, q2, p1);
        let dir4 = orientation(q1, q2, p2);
        if ((dir1 != dir2) && (dir3 != dir4)) {
            return true;
        }
        if ((dir1 == 0) && isOnSegment(q1, p1, p2)) {
            return true;
        }
        if ((dir2 == 0) && isOnSegment(q2, p1, p2)) {
            return true;
        }
        if ((dir3 == 0) && isOnSegment(p1, q1, q2)) {
            return true;
        }
        if ((dir4 == 0) && isOnSegment(p2, q1, q2)) {
            return true;
        }
        return false;
    }

    /**
     * Determines if a point is within a convex polygon.
     * @param {p5.Vector} point A point.
     * @param {p5.Vector[]} polygon A list of vertices.
     * 
     * @returns True if the point is inside the polygon.
     */
    this.isPointInsidePolygon = function (point, polygon) {
        const extreme = createVector(1000000, point.y);
        let count = 0;
        let i = 0;
        do {
            const next = (i + 1) % polygon.length;
            if (this_.linesIntersect(polygon[i], polygon[next], point, extreme)) {
                ++count;
            }
            i = next;
        } while (i > 0);
        return (count % 2) == 1;
    }
}).call(p5ext);
