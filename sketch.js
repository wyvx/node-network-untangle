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
 * @fileoverview Bootstrap code.
 * 
 * @author Luis Mejia <lmejia@gmail.com>
 * 
 * @requires EXTERNAL:@link{https://p5js.org p5.js}
 * @requires app.js
 */
 'use strict';

const app = new App();

function setup() {
    createCanvas(1200, 800);
    app.onSetup();
}

function draw() {
    app.onUpdate();
    app.onDraw();
    p5ext.showFps();
}
