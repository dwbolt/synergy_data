(this.xMin)// An import statement allows your code to use jscad methods:
const jscad    = require('@jscad/modeling')

const { cube, cuboid, cylinder, cylinderElliptic, ellipsoid, geodesicSphere, roundedCuboid, roundedCylinder, sphere, torus } = jscad.primitives
const { colorize, hslToRgb, colorNameToRgb, hexToRgb, hsvToRgb } = jscad.colors;
const { translate,rotate } = jscad.transforms
const { degToRad }  = jscad.utils


class material {  ///////////////////////////////////////////

// material method
constructor( xLength, yLength, zLength) {
  console.log("material.constructor()")
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


class shelter {   ///////////////////////////////////////////////////

// shelter method
constructor() {
  console.log("shelter.constructor()");
  this.draw = []    // contains all the drawings

  // lumber  using feet
  this.plywood = .75/12;

  this.lumber2 = 1.5/12;
  this.lumber1 = this.lumber2/2;
  this.lumber4 = 3.5/12;
  this.lumber6 = 5.5/12;
  this.lumber8 = 7.5/12;

  this.slab  = new material(12, 8, .5 );                       // concreate slab
  this.post  = new material(this.lumber6, this.lumber6, 8);    // Post
  this.beam  = new material(this.lumber6, 10 , this.lumber6);  // beam on top of Post
  this.joist = new material(10, this.lumber2, this.lumber8);   // joist under beam
  this.rafter = new material(this.lumber2,8, this.lumber8);   // joist under beam

  this.xMin = this.slab.xMin() + 1;    // post offesets from slab
  this.xMax = this.slab.xMax() - 1;
  this.yMin = this.slab.yMin() + 1;
  this.yMax = this.slab.yMax() - 1;

  // truss
  this.trussWidth  = this.lumber2;
  this.trussDepth  = this.lumber6;
  this.trussLength =     14;
  this.trussPitch  = 6/12;
}


// shelter method
concrete() {
  console.log("concrete()");
  this.slab.color = "grey";

  const ramp = new material(5, 5, this.slab.zLength)
  ramp.color = "grey";

  ramp.alignXmax( this.slab.xMax() );
  ramp.alignYmax( this.slab.yMin() );

  this.draw.push( this.slab.draw(), ramp.draw() );
}


// shelter method
sixBy() {
  console.log("sixBy()");
  // 4 8 ft posts
  this.post.color="pink";


  // front left
  this.post.alignXmin(this.xMin);
  this.post.alignYmin(this.yMin);
  this.post.alignZmin(this.slab.zMax()    );
  this.draw.push( this.post.draw() );
  const topPost = this.post.zMax();

  // front right
  this.post.alignXmax(this.xMax);
  this.draw.push( this.post.draw() );

  // back right
  this.post.alignYmax(this.yMax);
  this.draw.push( this.post.draw() );

  // back left
  this.post.alignXmin(this.slab.xMin() + 1);
  this.draw.push( this.post.draw() );

  // long post in back
  this.post.zLength += 3;
  this.post.xCenter =  0;
  this.post.alignZmin(this.slab.zMax()    );
  this.draw.push( this.post.draw() );

  // short support in front
  const max = this.post.zMax();
  this.post.zLength = 3.5;
  console.log(`postMin:${this.post.zMin()} postMax: ${max}`)
  this.post.alignZmax(max)
  this.post.alignYmin(this.slab.yMin() + 1);
  this.draw.push( this.post.draw() );

  // beam on post
  this.beam.color="pink";
  this.beam.alignZmin(topPost);
  this.beam.alignXmin(this.xMin);
  this.draw.push( this.beam.draw() );

  this.beam.alignXmax(this.xMax);
  this.draw.push( this.beam.draw() );

  // 45 degree suport -- needs work
  //const support = new brace(3, this.lumber6, this.lumber6);
  //support.alignXmin(xMin);
  //support.alignYmin(this.yMin);
  //this.draw.push( support.draw() );
  //this.draw.push( rotate([0,degToRad(-45),0], support.draw() ));

  // seat support

}


// shelter method
twoBy8() {
  console.log("twoBy8()");
  // 4 joist unber  beam
  this.joist.color = "purple";

  this.joist.alignZmax( this.beam.zMin());   // closest to front
  this.joist.alignYmax( this.post.yMin());
  this.draw.push( this.joist.draw() );

  this.joist.alignYmin( this.post.yMax()); // closest to other side of post
  this.draw.push( this.joist.draw() );

  this.joist.alignYmax( this.yMax-this.lumber6); // front of back post
  this.draw.push( this.joist.draw() );

  this.joist.alignYmin( this.yMax); // back of back post
  this.draw.push( this.joist.draw() );

  // end pices for joist
  const end = new material(this.lumber2, 6+2*this.lumber2, this.lumber8);
  end.color = "purple";
  end.alignZmin(this.joist.zMin());
  end.alignXmax(this.joist.xMin());
  this.draw.push( end.draw() );

  end.alignXmin(this.xMax);
  this.draw.push( end.draw() );

  // ridge board
  end.yLength = 10;
  end.xCenter = 0;
  end.alignZmin(this.post.zMax());
  this.draw.push( end.draw() );
}

twoBy6(){
    // roof rafters

}


// shelter method
main() {
  this.concrete();
  this.sixBy();
  this.twoBy8();
  this.twoBy6();
}


}  // end class shelter

// A function declaration that returns geometry
function main() { /////////////////////////////////////////////////////////////////
//debugger;

  const  app = new shelter();  // create instance
         app.main();           // create all the CAD data
  return app.draw;             // display it

}


// A declaration of what elements in the module (this file) are externally available.
module.exports = { main }
