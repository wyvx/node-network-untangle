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
 * @fileoverview Autonomous agent that implements steering behaviors.
 * 
 * @author Luis Mejia <lmejia@gmail.com>
 * 
 * @requires EXTERNAL:@link{https://p5js.org p5.js}
 */
'use strict';

class AutonomousAgent {

    constructor(position) {
        this.position = position;
        this.speed = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.decelarationRate = 0.1;

        this.maxSpeed = 3;
        this.maxForce = 0.1;
        this.arriveDistance = 100;
        this.rejectDistance = 60;
        this.stalkDistance = {
            min: 40,
            max: 100
        };
    }

    update() {
        if (this.acceleration.mag() > 0) {
            // Accelerate.
            this.speed.add(this.acceleration);
            this.speed.limit(this.maxSpeed);
            this.acceleration.mult(0);
        } else {
            // Decelerate.
            const speedMag = this.speed.mag() - this.decelarationRate;
            this.speed.setMag(speedMag > 0 ? speedMag : 0);
        }
        this.position.add(this.speed);
    }

    applyForce(force) {
        this.acceleration.add(force);
    }

    steer(vector) {
        const steer = p5.Vector.sub(vector, this.speed);
        steer.limit(this.maxForce);
        this.applyForce(steer);
    }

    seek(target) {
        const desired = p5.Vector.sub(target, this.position);
        desired.setMag(this.maxSpeed);
        return desired;
    }

    flee(target) {
        const desired = p5.Vector.sub(this.position, target);
        desired.setMag(this.maxSpeed);
        return desired;
    }

    arrive(target, arriveDistance = this.arriveDistance) {
        const desired = p5.Vector.sub(target, this.position);
        const desiredMag = desired.mag();
        if (desiredMag < arriveDistance) {
            const mag = map(desiredMag, 0, arriveDistance, 0, this.maxSpeed);
            desired.setMag(mag);
        } else {
            desired.setMag(this.maxSpeed);
        }
        return desired;
    }

    reject(target, rejectDistance = this.rejectDistance) {
        const desired = p5.Vector.sub(this.position, target);
        const desiredMag = desired.mag();
        if (desiredMag >= rejectDistance) {
            return createVector(0, 0);
        }
        desired.setMag(this.maxSpeed);
        return desired;
    }

    stalk(target, stalkDistance = this.stalkDistance) {
        const desired = p5.Vector.sub(target, this.position);
        const desiredMag = desired.mag();
        if ((desiredMag >= stalkDistance.min) && (desiredMag <= stalkDistance.max)) {
            return createVector(0, 0);
        }
        if (desiredMag < stalkDistance.min) {
            desired.mult(-1);
        }
        desired.setMag(this.maxSpeed);
        return desired;
    }

    groupBehavior(agents, behavior, behaviorParam = undefined) {
        const sum = createVector(0, 0);
        let count = 0;
        agents.forEach(agent => {
            if (agent == this) {
                return;
            }
            const vector = behavior.call(this, agent.position, behaviorParam);
            if (vector.mag() > 0) {
                sum.add(vector);
                ++count;
            }
        });
        if (count > 0) {
            sum.div(count);
            sum.limit(this.maxSpeed);
        }
        return sum;
    }

    contain(polygon) {
        // Convex polygons only!
        if ((polygon.length < 3) || p5ext.isPointInsidePolygon(this.position, polygon)) {
            return createVector(0, 0);
        }
        let centroid = createVector(0, 0);
        polygon.forEach(vertex => {
            centroid.add(vertex);
        });
        centroid.div(polygon.length);
        return this.seek(centroid);
    }
}
