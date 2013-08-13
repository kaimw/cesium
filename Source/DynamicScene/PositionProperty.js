/*global define*/
define([
        '../Core/Cartesian3',
        '../Core/defined',
        '../Core/DeveloperError',
        '../Core/Matrix3',
        '../Core/ReferenceFrame',
        '../Core/Transforms'
    ], function(
        Cartesian3,
        defined,
        DeveloperError,
        Matrix3,
        ReferenceFrame,
        Transforms) {
    "use strict";

    function throwInstantiationError() {
        throw new DeveloperError('This type should not be instantiated directly.');
    }

    /**
     * The base class for position properties, which are {@link Property} objects
     * with an associated {@link ReferenceFrame} and {@link Cartesian3} value.
     * This type defines an interface and cannot be instantiated directly.
     *
     * @alias PositionProperty
     * @constructor
     *
     * @see CompositePositionProperty
     * @see ConstantPositionProperty
     * @see SampledPositionProperty
     * @see TimeIntervalCollectionPositionProperty
     */
    var PositionProperty = throwInstantiationError;

    /**
     * If the property varies with simulation time, this function returns true.  If the property
     * is constant or changes in ways not related to simulation time, this function returns false.
     *
     * @memberof PositionProperty
     * @returns {Boolean} True if the property varies with simulation time, false otherwise.
     */
    PositionProperty.prototype.getIsTimeVarying = throwInstantiationError;

    /**
     * Gets the reference frame that the position is defined in.
     *
     * @memberof PositionProperty
     * @returns {ReferenceFrame} The reference frame that the position is defined in.
     */
    PositionProperty.prototype.getReferenceFrame = throwInstantiationError;

    /**
     * Returns the value of the property at the specified simulation time in the fixed frame.
     * @memberof PositionProperty
     *
     * @param {JulianDate} time The simulation time for which to retrieve the value.
     * @param {Object} [result] The object to store the value into, if omitted, a new instance is created and returned.
     * @returns {Object} The modified result parameter or a new instance if the result parameter was not supplied.
     */
    PositionProperty.prototype.getValue = throwInstantiationError;

    /**
     * Returns the value of the property at the specified simulation time in the specified reference frame.
     * @memberof PositionProperty
     *
     * @param {JulianDate} time The simulation time for which to retrieve the value.
     * @param {ReferenceFrame} [referenceFrame=ReferenceFrame.FIXED] The desired referenceFrame of the result.
     * @param {Cartesian3} [result] The object to store the value into, if omitted, a new instance is created and returned.
     * @returns {Cartesian3} The modified result parameter or a new instance if the result parameter was not supplied.
     */
    PositionProperty.prototype.getValueInReferenceFrame = throwInstantiationError;

    var scratchMatrix3 = new Matrix3();

    /**
     * @private
     */
    PositionProperty.convertToReferenceFrame = function(time, value, inputFrame, outputFrame, result) {
        if (inputFrame === outputFrame) {
            return Cartesian3.clone(value, result);
        }

        var icrfToFixed = Transforms.computeIcrfToFixedMatrix(time, scratchMatrix3);
        if (defined(icrfToFixed)) {
            icrfToFixed = Transforms.computeTemeToPseudoFixedMatrix(time, scratchMatrix3);
        }
        if (inputFrame === ReferenceFrame.INERTIAL) {
            return icrfToFixed(scratchMatrix3).multiplyByVector(value, result);
        }
        if (inputFrame === ReferenceFrame.FIXED) {
            return icrfToFixed.transpose(scratchMatrix3).multiplyByVector(value, result);
        }
    };

    return PositionProperty;
});