// An import statement allows your code to use jscad methods:
const jscad    = require('@jscad/modeling')

const { cube, cuboid, cylinder, cylinderElliptic, ellipsoid, geodesicSphere, roundedCuboid, roundedCylinder, sphere, torus } = jscad.primitives
const { colorize, hslToRgb, colorNameToRgb, hexToRgb, hsvToRgb } = jscad.colors;
const { translate,rotate } = jscad.transforms
const { degToRad }  = jscad.utils

/*
class material {  ///////////////////////////////////////////

// material method
constructor( xLength, yLength, zLength) {
  this.xLength = xLength;
  this.yLength = yLength;
  this.zLength = zLength;

  this.xCenter = 0;
  this.yCenter = 0;
  this.zCenter = 0;

  this.color = "brown";
}

// material method
draw() {
  return colorize( colorNameToRgb(this.color), cuboid( {
    size:   [this.xLength, this.yLength, this.zLength],
    center: [this.xCenter, this.yCenter, this.zCenter]
  } ))
}


// material method
alignXmax(x) {const diff = (this.xLength/2 + this.xCenter) - x; this.xCenter += - diff;}
alignYmax(y) {const diff = (this.yLength/2 + this.yCenter) - y; this.yCenter += - diff;}
alignZmax(z) {const diff = (this.zLength/2 + this.zCenter) - z; this.zCenter += - diff;}

// material method
alignXmin(x) {const diff = (-this.xLength/2 + this.xCenter) - x; this.xCenter += - diff;}
alignYmin(y) {const diff = (-this.yLength/2 + this.yCenter) - y; this.yCenter += - diff;}
alignZmin(z) {const diff = (-this.zLength/2 + this.zCenter) - z; this.zCenter += - diff;}

// material method
xMax() {return this.xLength/2 + this.xCenter;}
yMax() {return this.yLength/2 + this.yCenter;}
zMax() {return this.zLength/2 + this.zCenter;}

// material method
xMin() {return -this.xLength/2 + this.xCenter;}
yMin() {return -this.yLength/2 + this.yCenter;}
zMin() {return -this.zLength/2 + this.zCenter;}

}  // end material
*/

/*

class beeHive {   ///////////////////////////////////////////////////

// beeHive method
constructor() {
  this.draw = []    // contains all the drawings

  // lumber using feet
  this.plywood = .62/12;
  this.lumber2 = 1.5/12;
  this.lumber1 = this.lumber2/2;
  this.lumber4 = 3.5/12;

  this.iEndY = 14/12; // get right number
  this.iEndZ = 17/12; // get right number
  this.iEnd  = new material(this.plywood, this.iEndY, this.iEndZ);
  this.draw.push( this.iEnd.draw() );
}


// beeHive method
innerWalls(){

}

// beeHive method
main() {
  this.innerWalls();
}


}  // end class beeHive
*/


// A function declaration that returns geometry
function main() { /////////////////////////////////////////////////////////////////
debugger;/*
  const  app = new shelter();  // create instance
         app.main();           // create all the CAD data
  return app.draw;             // display it
*/
// A function declaration that returns geometry

  return cube();
}

// A declaration of what elements in the module (this file) are externally available.
module.exports = { main }
}


// A declaration of what elements in the module (this file) are externally available.
module.exports = { main }
