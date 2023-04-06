/**
 * Basic Extrude Functions
 * @category Creating Shapes
 * @skillLevel 5
 * @description Demonstrating the basic types of extrusions, and the variety of objects they can create.
 * @tags extrude, linear, extrudelinear, extruderectangular, extruderotate
 * @authors Rene K. Mueller, Moissette Mark, Simon Clark
 * @licence MIT License
 */

const jscad = require('@jscad/modeling')
const { line, polygon, star } = jscad.primitives
const { extrudeRectangular, extrudeLinear, extrudeRotate } = jscad.extrusions
const { translate } = jscad.transforms
const { expand } = jscad.expansions

const main = () => {
  const shapes = [];

  /*
  const aLine = line([[0, 0], [5, 5]])
  //shapes.push(aLine))

  const aRectangularExtrude = extrudeRectangular({ size: 1, height: 1 }, aLine)
  shapes.push(aRectangularExtrude)
*/

/*
  const anExpandedExtrude = extrudeLinear({ height: 1 }, expand({ delta: 1, corners: 'round', segments: 32 }, aLine))
  shapes.push(translate([-7, 0, 0], anExpandedExtrude))
*/
debugger;
  const poly = polygon({ points: [[-1, -1], [3, -1], [3.5, 2], [2, 1], [1, 2], [0, 1], [-1, 2]] })
  //const extrudedPoly = extrudeLinear({ height: 5, twistAngle: Math.PI / 4, twistSteps: 10 }, poly)
  const extrudedPoly = extrudeLinear({ height: 5 }, poly)
  shapes.push(translate([-1, 0, 0], extrudedPoly))

/*
  const starPoly = translate([3, 0, 0], star())
  const extrudedStar = extrudeRotate({ segments: 32, startAngle: 0, angle: (Math.PI * 0.75), overflow: 'cap' }, starPoly)
  shapes.push(translate([9, 0, 0], extrudedStar))
*/
  return shapes
}

module.exports = { main }
