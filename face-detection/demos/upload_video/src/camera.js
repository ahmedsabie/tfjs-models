/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import {drawPath, distance} from './shared/util';
import {NUM_KEYPOINTS, NUM_IRIS_KEYPOINTS, GREEN, RED} from './shared/params';
import {TRIANGULATION} from './shared/triangulation';

export class Context {
  constructor() {
    this.video = document.getElementById('video');
    this.canvas = document.getElementById('output');
    this.source = document.getElementById('currentVID');
    this.ctx = this.canvas.getContext('2d');
    const stream = this.canvas.captureStream();
    const options = {mimeType: 'video/webm; codecs=vp9'};
    this.mediaRecorder = new MediaRecorder(stream, options);
    this.mediaRecorder.ondataavailable = this.handleDataAvailable;
  }

  drawCtx() {
    this.ctx.drawImage(
        this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);
  }

  clearCtx() {
    this.ctx.clearRect(0, 0, this.video.videoWidth, this.video.videoHeight);
  }

  /**
   * Draw the keypoints on the video.
   * @param faces A list of faces to render.
   */
   drawResults(faces, triangulateMesh) {
    faces.forEach((face) => {
      const keypoints = face.keypoints.map((keypoint) => [keypoint.x, keypoint.y]);

      const ctx = this.ctx;
      if (triangulateMesh) {
        ctx.strokeStyle = GREEN;
        ctx.lineWidth = 0.5;

        for (let i = 0; i < TRIANGULATION.length / 3; i++) {
          const points = [
            TRIANGULATION[i * 3], TRIANGULATION[i * 3 + 1],
            TRIANGULATION[i * 3 + 2],
          ].map((index) => keypoints[index]);

          drawPath(ctx, points, true);
        }
      } else {
        ctx.fillStyle = GREEN;

        for (let i = 0; i < NUM_KEYPOINTS; i++) {
          const x = keypoints[i][0];
          const y = keypoints[i][1];

          ctx.beginPath();
          ctx.arc(x, y, 1 /* radius */, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      if (keypoints.length > NUM_KEYPOINTS) {
        ctx.strokeStyle = RED;
        ctx.lineWidth = 1;

        const leftCenter = keypoints[NUM_KEYPOINTS];
        const leftDiameterY = distance(
            keypoints[NUM_KEYPOINTS + 4], keypoints[NUM_KEYPOINTS + 2]);
        const leftDiameterX = distance(
            keypoints[NUM_KEYPOINTS + 3], keypoints[NUM_KEYPOINTS + 1]);

        ctx.beginPath();
        ctx.ellipse(
            leftCenter[0], leftCenter[1], leftDiameterX / 2, leftDiameterY / 2,
            0, 0, 2 * Math.PI);
        ctx.stroke();

        if (keypoints.length > NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS) {
          const rightCenter = keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS];
          const rightDiameterY = distance(
              keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 2],
              keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 4]);
          const rightDiameterX = distance(
              keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 3],
              keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 1]);

          ctx.beginPath();
          ctx.ellipse(
              rightCenter[0], rightCenter[1], rightDiameterX / 2,
              rightDiameterY / 2, 0, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
    });
  }
}
