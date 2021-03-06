/*global defineSuite*/
defineSuite([
         'Scene/EllipsoidPrimitive',
         'Specs/createContext',
         'Specs/destroyContext',
         'Specs/createCamera',
         'Specs/createFrameState',
         'Specs/pick',
         'Specs/render',
         'Core/Cartesian3',
         'Core/defined',
         'Core/Matrix4',
         'Renderer/ClearCommand',
         'Scene/Material'
     ], function(
         EllipsoidPrimitive,
         createContext,
         destroyContext,
         createCamera,
         createFrameState,
         pick,
         render,
         Cartesian3,
         defined,
         Matrix4,
         ClearCommand,
         Material) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    var context;
    var ellipsoid;
    var frameState;
    var us;

    beforeAll(function() {
        context = createContext();
    });

    afterAll(function() {
        destroyContext(context);
    });

    beforeEach(function() {
        ellipsoid = new EllipsoidPrimitive();
        frameState = createFrameState(createCamera(context, new Cartesian3(1.02, 0.0, 0.0), Cartesian3.ZERO, Cartesian3.UNIT_Z));
        us = context.getUniformState();
        us.update(frameState);
    });

    afterEach(function() {
        us = undefined;
        if (defined(ellipsoid) && !ellipsoid.isDestroyed()) {
            ellipsoid = ellipsoid.destroy();
        }
    });

    it('gets the default properties', function() {
        expect(ellipsoid.show).toEqual(true);
        expect(ellipsoid.center).toEqual(Cartesian3.ZERO);
        expect(ellipsoid.radii).toBeUndefined();
        expect(ellipsoid.modelMatrix).toEqual(Matrix4.IDENTITY);
        expect(ellipsoid.material.type).toEqual(Material.ColorType);
    });

    it('renders with the default material', function() {
        ellipsoid.radii = new Cartesian3(1.0, 1.0, 1.0);

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, ellipsoid);
        expect(context.readPixels()).toNotEqual([0, 0, 0, 0]);
    });

    it('renders with a custom modelMatrix', function() {
        ellipsoid.radii = new Cartesian3(0.1, 0.1, 0.1);
        ellipsoid.modelMatrix = Matrix4.fromScale(new Cartesian3(10.0, 10.0, 10.0));

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, ellipsoid);
        expect(context.readPixels()).not.toEqual([0, 0, 0, 0]);
    });

    it('renders two with a vertex array cache hit', function() {
        ellipsoid.radii = new Cartesian3(1.0, 1.0, 1.0);
        var ellipsoid2 = new EllipsoidPrimitive();
        ellipsoid2.radii = new Cartesian3(1.0, 1.0, 1.0);

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, ellipsoid);
        expect(context.readPixels()).not.toEqual([0, 0, 0, 0]);

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, ellipsoid2);
        expect(context.readPixels()).not.toEqual([0, 0, 0, 0]);

        ellipsoid2.destroy();
    });

    it('does not render when show is false', function() {
        ellipsoid.radii = new Cartesian3(1.0, 1.0, 1.0);
        ellipsoid.show = false;

        expect(render(context, frameState, ellipsoid)).toEqual(0);
    });

    it('does not render without radii', function() {
        expect(render(context, frameState, ellipsoid)).toEqual(0);
    });

    it('does not render when not in view due to center', function() {
        ellipsoid.radii = new Cartesian3(1.0, 1.0, 1.0);
        ellipsoid.center = new Cartesian3(10.0, 0.0, 0.0);

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, ellipsoid);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);
    });

    it('is picked', function() {
        ellipsoid.radii = new Cartesian3(1.0, 1.0, 1.0);

        var pickedObject = pick(context, frameState, ellipsoid, 0, 0);
        expect(pickedObject).toEqual(ellipsoid);
    });

    it('is not picked (show === false)', function() {
        ellipsoid.radii = new Cartesian3(1.0, 1.0, 1.0);
        ellipsoid.show = false;

        var pickedObject = pick(context, frameState, ellipsoid, 0, 0);
        expect(pickedObject).not.toBeDefined();
    });

    it('is not picked (alpha === 0.0)', function() {
        ellipsoid.radii = new Cartesian3(1.0, 1.0, 1.0);
        ellipsoid.material.uniforms.color.alpha = 0.0;

        var pickedObject = pick(context, frameState, ellipsoid, 0, 0);
        expect(pickedObject).not.toBeDefined();
    });

    it('isDestroyed', function() {
        expect(ellipsoid.isDestroyed()).toEqual(false);
        ellipsoid.destroy();
        expect(ellipsoid.isDestroyed()).toEqual(true);
    });

    it('throws when rendered without a material', function() {
        ellipsoid.radii = new Cartesian3(1.0, 1.0, 1.0);
        ellipsoid.material = undefined;

        expect(function() {
            render(context, frameState, ellipsoid);
        }).toThrow();
    });
}, 'WebGL');
