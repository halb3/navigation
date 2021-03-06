
/* spellchecker: disable */

import { mat4, m4, vec2, v2, vec3, v3 } from '@haeley/math';

import { CameraModifier } from './cameramodifier';

/* spellchecker: enable */

export class PanModifier extends CameraModifier {

    protected static readonly DEFAULT_SENSITIVITY = 0.002;

    protected _sensitivity: number = PanModifier.DEFAULT_SENSITIVITY;

    protected _translation: vec3 = v3();

    /**
     * Initiate a new panning at a specific event position.
     * @param point - Position of the current event to derive the magnitude for rotation from.
     */
    initiate(point: vec2): void {
        Object.assign(this._reference, this._camera);

        /* Retrieve initial event position. */
        this._initialPoint = point;
    }

    /**
     * Update the panning transform w.r.t. a specific event position.
     * @param point - Position of the current event to derive the magnitude for translation from.
     */
    process(point: vec2): void {
        /* Retrieve current event positions. */
        this._currentPoint = point;

        const magnitudes = vec2.subtract(v2(), this._initialPoint, this._currentPoint);
        vec2.scale(magnitudes, magnitudes, window.devicePixelRatio * this._sensitivity);

        const centerToEye = vec3.sub(v3(), this._reference.eye, this._reference.center);
        vec3.normalize(centerToEye, centerToEye);
        const up = this._reference.up;
        vec3.normalize(up, up);
        const right = vec3.cross(v3(), up, centerToEye);

        const rightTranslation = vec3.scale(v3(), right, magnitudes[0]);
        const upTranslation = vec3.scale(v3(), up, magnitudes[1]);
        vec3.negate(upTranslation, upTranslation);
        this._translation = vec3.add(v3(), upTranslation, rightTranslation);

        this.update();
    }

    /**
     * Actually applies the trackball rotation to the given camera.
     */
    update(): void {
        if (this._camera === undefined) {
            return;
        }

        /* Adjust for arbitrary camera center and rotate using quaternion based rotation. */
        const T = mat4.fromTranslation(m4(), this._translation);

        const eye = vec3.transformMat4(v3(), this._reference.eye, T);
        const center = vec3.transformMat4(v3(), this._reference.center, T);

        this._camera.eye = eye;
        this._camera.center = center;
    }

}
