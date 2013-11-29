/*
 * Matrix2D
 * Visit http://createjs.com/ for documentation, updates and examples.
 *
 * Copyright (c) 2010 gskinner.com, inc.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * Represents an affine transformation matrix, and provides tools for constructing and concatenating matrixes.
	 * @alias cavy.Matrix2D
	 * @constructor
	 * @param {Number} a Specifies the a property for the new matrix.
	 * @param {Number} b Specifies the b property for the new matrix.
	 * @param {Number} c Specifies the c property for the new matrix.
	 * @param {Number} d Specifies the d property for the new matrix.
	 * @param {Number} tx Specifies the tx property for the new matrix.
	 * @param {Number} ty Specifies the ty property for the new matrix.
	 **/
	var Matrix2D = function (a, b, c, d, tx, ty, op) {
		this.a = 1;
		this.b = 0;
		this.c = 0;
		this.d = 1;
		this.e = 0;
		this.f = 0;
		this.opacity = 1;
		this.initialize(a, b, c, d, tx, ty, op);
	};
	/**
	 * An identity matrix, representing a null transformation. Read-only.
	 * @property identity
	 * @static
	 * @type Matrix2D
	 **/
	Matrix2D.identity = null; // set at bottom of class definition.
	/**
	 * Multiplier for converting degrees to radians. Used internally by Matrix2D. Read-only.
	 * @property DEG_TO_RAD
	 * @static
	 * @final
	 * @type Number
	 **/
	Matrix2D.DEG_TO_RAD = Math.PI / 180;
	Matrix2D.prototype = {
		// static public properties:
		constructor: Matrix2D,
		// public properties:
		/**
		 * Position (0, 0) in a 3x3 affine transformation matrix.
		 * @property a
		 * @type Number
		 **/
		a: 1,
		/**
		 * Position (0, 1) in a 3x3 affine transformation matrix.
		 * @property b
		 * @type Number
		 **/
		b: 0,
		/**
		 * Position (1, 0) in a 3x3 affine transformation matrix.
		 * @property c
		 * @type Number
		 **/
		c: 0,
		/**
		 * Position (1, 1) in a 3x3 affine transformation matrix.
		 * @property d
		 * @type Number
		 **/
		d: 1,
		/**
		 * Position (2, 0) in a 3x3 affine transformation matrix.
		 * @property tx
		 * @type Number
		 **/
		e: 0,
		/**
		 * Position (2, 1) in a 3x3 affine transformation matrix.
		 * @property ty
		 * @type Number
		 **/
		f: 0,
		/**
		 * Property representing the alpha that will be applied to a display object. This is not part of matrix
		 * operations, but is used for operations like getConcatenatedMatrix to provide concatenated alpha values.
		 * @property alpha
		 * @type Number
		 **/
		opacity: 1,
		// constructor:
		/**
		 * Initialization method.
		 * @protected
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 */
		initialize: function (a, b, c, d, tx, ty, op) {
			if (a != null) {
				this.a = a;
			}
			this.b = b || 0;
			this.c = c || 0;
			if (d != null) {
				this.d = d;
			}
			this.e = tx || 0;
			this.f = ty || 0;
			this.opacity = isNaN(op) ? 1 : op;
			return this;
		},
		// public methods:
		/**
		 * Concatenates the specified matrix properties with this matrix. All parameters are required.
		 * @param {Number} a
		 * @param {Number} b
		 * @param {Number} c
		 * @param {Number} d
		 * @param {Number} tx
		 * @param {Number} ty
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 **/
		prepend: function (a, b, c, d, tx, ty) {
			var tx1 = this.e;
			if (a !== 1 || b !== 0 || c !== 0 || d !== 1) {
				var a1 = this.a, c1 = this.c;
				this.a = a1 * a + this.b * c;
				this.b = a1 * b + this.b * d;
				this.c = c1 * a + this.d * c;
				this.d = c1 * b + this.d * d;
			}
			this.e = tx1 * a + this.f * c + tx;
			this.f = tx1 * b + this.f * d + ty;
			return this;
		},
		/**
		 * Appends the specified matrix properties with this matrix. All parameters are required.
		 * @param {Number} a
		 * @param {Number} b
		 * @param {Number} c
		 * @param {Number} d
		 * @param {Number} tx
		 * @param {Number} ty
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 **/
		append: function (a, b, c, d, tx, ty) {
			var a1 = this.a, b1 = this.b, c1 = this.c, d1 = this.d;
	
			this.a = a * a1 + b * c1;
			this.b = a * b1 + b * d1;
			this.c = c * a1 + d * c1;
			this.d = c * b1 + d * d1;
			this.e = tx * a1 + ty * c1 + this.e;
			this.f = tx * b1 + ty * d1 + this.f;
			return this;
		},
		/**
		 * Prepends the specified matrix with this matrix.
		 * @param {Matrix2D} matrix
		 **/
		prependMatrix: function (matrix) {
			this.prepend(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
			return this;
		},
		/**
		 * Appends the specified matrix with this matrix.
		 * @param {Matrix2D} matrix
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 **/
		appendMatrix: function (matrix) {
			this.append(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
			return this;
		},
		/**
		 * Generates matrix properties from the specified display object transform properties, and prepends them with this matrix.
		 * For example, you can use this to generate a matrix from a display object: var mtx = new Matrix2D();
		 * mtx.prependTransform(o.x, o.y, o.scaleX, o.scaleY, o.rotation);
		 * @param {Number} x
		 * @param {Number} y
		 * @param {Number} scaleX
		 * @param {Number} scaleY
		 * @param {Number} rotation
		 * @param {Number} skewX
		 * @param {Number} skewY
		 * @param {Number} regX Optional.
		 * @param {Number} regY Optional.
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 **/
		prependTransform: function (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
			var cos = 1, sin = 0;
			if (rotation % 360) {
				var r = rotation * Matrix2D.DEG_TO_RAD;
				cos = Math.cos(r);
				sin = Math.sin(r);
			}
	
			if (regX || regY) {
				// append the registration offset:
				this.e -= regX;
				this.f -= regY;
			}
			if (skewX || skewY) {
				// TODO: can this be combined into a single prepend operation?
				skewX *= Matrix2D.DEG_TO_RAD;
				skewY *= Matrix2D.DEG_TO_RAD;
				this.prepend(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
				this.prepend(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
			} else {
				this.prepend(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
			}
			return this;
		},
		/**
		 * Generates matrix properties from the specified display object transform properties, and appends them with this matrix.
		 * For example, you can use this to generate a matrix from a display object: var mtx = new Matrix2D();
		 * mtx.appendTransform(o.x, o.y, o.scaleX, o.scaleY, o.rotation);
		 * @param {Number} x
		 * @param {Number} y
		 * @param {Number} scaleX
		 * @param {Number} scaleY
		 * @param {Number} rotation
		 * @param {Number} skewX
		 * @param {Number} skewY
		 * @param {Number} regX Optional.
		 * @param {Number} regY Optional.
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 **/
		appendTransform: function (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
			var cos = 1, sin = 0;
			if (rotation % 360) {
				var r = rotation * Matrix2D.DEG_TO_RAD;
				cos = Math.cos(r);
				sin = Math.sin(r);
			}
	
			if (skewX || skewY) {
				// TODO: can this be combined into a single append?
				skewX *= Matrix2D.DEG_TO_RAD;
				skewY *= Matrix2D.DEG_TO_RAD;
				this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
				this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
			} else {
				this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
			}
	
			if (regX || regY) {
				// prepend the registration offset:
				this.e -= regX * this.a + regY * this.c;
				this.f -= regX * this.b + regY * this.d;
			}
			return this;
		},
		/**
		 * Applies a rotation transformation to the matrix.
		 * @param {Number} angle The angle in radians. To use degrees, multiply by <code>Math.PI/180</code>.
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 **/
		rotate: function (angle) {
			angle *= Matrix2D.DEG_TO_RAD;
			var cos = Math.cos(angle), sin = Math.sin(angle), a1 = this.a, c1 = this.c, tx1 = this.e;
	
			this.a = a1 * cos - this.b * sin;
			this.b = a1 * sin + this.b * cos;
			this.c = c1 * cos - this.d * sin;
			this.d = c1 * sin + this.d * cos;
			this.e = tx1 * cos - this.f * sin;
			this.f = tx1 * sin + this.f * cos;
			return this;
		},
		/**
		 * Applies a skew transformation to the matrix.
		 * @param {Number} skewX The amount to skew horizontally in degrees.
		 * @param {Number} skewY The amount to skew vertically in degrees.
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 */
		skew: function (skewX, skewY) {
			skewX = skewX * Matrix2D.DEG_TO_RAD;
			skewY = skewY * Matrix2D.DEG_TO_RAD;
			this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), 0, 0);
			return this;
		},
		/**
		 * Applies a scale transformation to the matrix.
		 * @param {Number} x The amount to scale horizontally
		 * @param {Number} y The amount to scale vertically
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 **/
		scale: function (x, y) {
			this.a *= x;
			this.d *= y;
			this.c *= x;
			this.b *= y;
			this.e *= x;
			this.f *= y;
			return this;
		},
		/**
		 * Translates the matrix on the x and y axes.
		 * @param {Number} x
		 * @param {Number} y
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 **/
		translate: function (x, y) {
			this.e += x;
			this.f += y;
			return this;
		},
		/**
		 * Sets the properties of the matrix to those of an identity matrix (one that applies a null transformation).
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 **/
		identity: function () {
			this.a = this.d = this.opacity = 1;
			this.b = this.c = this.e = this.f = 0;
			return this;
		},
		/**
		 * Inverts the matrix, causing it to perform the opposite transformation.
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 **/
		invert: function () {
			var a1 = this.a, b1 = this.b, c1 = this.c, d1 = this.d, tx1 = this.e, n = a1 * d1 - b1 * c1;
			this.a = d1 / n;
			this.b = -b1 / n;
			this.c = -c1 / n;
			this.d = a1 / n;
			this.e = (c1 * this.f - d1 * tx1) / n;
			this.f = -(a1 * this.f - b1 * tx1) / n;
			return this;
		},
		/**
		 * Returns true if the matrix is an identity matrix.
		 * @return {Boolean}
		 **/
		isIdentity: function () {
			return this.e === 0 && this.f === 0 && this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1;
		},
		/**
		 * Decomposes the matrix into transform properties (x, y, scaleX, scaleY, and rotation). Note that this these values
		 * may not match the transform properties you used to generate the matrix, though they will produce the same visual
		 * results.
		 * @param {Object} target The object to apply the transform properties to. If null, then a new object will be returned.
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 */
		decompose: function (target) {
			// TODO: it would be nice to be able to solve for whether the matrix can be decomposed into only scale/rotation
			// even when scale is negative
			if (target == null) {
				target = {};
			}
			target.x = this.e;
			target.y = this.f;
			target.scaleX = Math.sqrt(this.a * this.a + this.b * this.b);
			target.scaleY = Math.sqrt(this.c * this.c + this.d * this.d);
	
			var skewX = Math.atan2(-this.c, this.d),
				skewY = Math.atan2(this.b, this.a);
	
			if (skewX == skewY) {
				target.rotation = skewY / Matrix2D.DEG_TO_RAD;
				if (this.a < 0 && this.d >= 0) {
					target.rotation += (target.rotation <= 0) ? 180 : -180;
				}
				target.skewX = target.skewY = 0;
			} else {
				target.skewX = skewX / Matrix2D.DEG_TO_RAD;
				target.skewY = skewY / Matrix2D.DEG_TO_RAD;
			}
			return target;
		},
		/**
		 * Returns a clone of the Matrix2D instance.
		 * @return {Matrix2D} a clone of the Matrix2D instance.
		 **/
		clone: function () {
			return new Matrix2D(this.a, this.b, this.c, this.d, this.e, this.f, this.opacity);
		},
		/**
		 * Returns a string representation of this object.
		 * @return {String} a string representation of the instance.
		 **/
		toString: function () {
			return "matrix(" + this.a + "," + this.b + "," + this.c + "," + this.d + "," + this.e + "," + this.f + ")";
		},
        toString3D: function() {
            return "matrix3d(" + this.a + "," + this.b + ",0,0," + this.c + "," + this.d + ",0,0,0,0,1,0," + this.e + "," + this.f + ",0,1)";
        }
	};
	// this has to be populated after the class is defined:
	Matrix2D.identity = new Matrix2D(1, 0, 0, 1, 0, 0);
	cavy.Matrix2D = Matrix2D;
})(window);