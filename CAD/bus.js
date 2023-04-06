/* CSG.scad - Bus shelter

all dimenstions are in feet

*/
///////////////// global parameters
// lumber
plywood = .75/12;

lumber2 = 1.5/12;
lumber1 = lumber2/2;
lumber4 = 3.5/12;
lumber6 = 5.5/12;
lumber8 = 7.5/12;

// slab
slabLength = 12;   // x
slabWidth  =  8;   // y
slabHeight =  0.5; // z

// Post
postHeight = 8;
postWidth  = lumber6;  // 6x6 posts, so width and length are the same
postTop    = slabHeight + postHeight;

postFrontY = 1;
postBackY  = slabWidth -1 - lumber6;
postX      = slabLength-1-postWidth;
postXm     = slabLength/2-lumber6/2;

// beam
beamTop = postTop + -.5;  // guess

// truss
trussWidth  = lumber2;
trussDepth  = lumber6;
trussLength =     14;
trussPitch  = 6/12;


main();

////////////////////////////// where  center
module main() {
  translate( [-slabLength/2, -slabWidth/2 ,-6] ) {
      // slab, it is at 0,0,0 origin
      color("lightgray") cube([slabLength, slabWidth, slabHeight]);

      // ramp
      color("lightgray")  translate([slabLength-5,-5,0]) cube([5, 5, slabHeight]);

      color("pink")   6by6();
      color("purple") 2by8();
      color("red")    2by6();
      color("blue")   1by8();
      seat();
      walls();
 }
}


/////////////// modules

module walls(){
    // ply wood
    plyZ = 2-lumber8;
    color("green") {
    translate( [ 1, 7,postTop-plyZ-lumber8] )         cube([10, plywood, plyZ]);
    translate( [11, 1,postTop-plyZ-lumber8] )         cube([plywood,  6, plyZ]);
    translate( [ 1-plywood, 1,postTop-plyZ-lumber8] ) cube([plywood,  6, plyZ]);
    }
    // lexan

    color("lightgreen") {
    // lexan 2x4 frame H
    translate( [1, 7,postTop-plyZ-lumber8-lumber4]  ) cube([10+lumber2,  lumber2, lumber4]);
    translate( [1, 7,postTop-plyZ-lumber8-lumber4-3]) cube([10+lumber2,  lumber2, lumber4]);

    translate( [1-lumber2, 1,postTop-plyZ-lumber8-lumber4]   ) cube([lumber2,  6, lumber4]);
    translate( [11, 1,postTop-plyZ-lumber8-lumber4]   ) cube([lumber2,  6, lumber4]);
    translate( [11, 1,postTop-plyZ-lumber8-lumber4-3] ) cube([lumber2,  6, lumber4]);

    // lexan 2x4 frame V back
    translate( [1, 7,postTop-plyZ-lumber8-3] ) cube([lumber4,lumber2,  3-lumber4, ]);
    translate( [(slabLength-lumber4)/2, 7,postTop-plyZ-lumber8-3] ) cube([lumber4,lumber2,  3-lumber4, ]);
    translate( [11-lumber4, 7,postTop-plyZ-lumber8-3] ) cube([lumber4,lumber2,  3-lumber4]);

    // lexan 2x4 frame V side
    translate( [11, 1,postTop-plyZ-lumber8-3] )         cube([lumber2,lumber4,  3-lumber4]);
    translate( [11, 7-lumber6,postTop-plyZ-lumber8-3] ) cube([lumber2,lumber4,  3-lumber4]);
    }
}


module 1by8() {
    // fascia
    translate( [-1-lumber1, -1 , postTop-.5] ) cube([lumber1, 10, lumber8]);
    translate( [13        , -1 , postTop-.5] ) cube([lumber1, 10, lumber8]);
}





module seat() {
    seatLenght = 2; // lenght of bracket
    seatY      = slabWidth-1-seatLenght;
    seatZ      = slabHeight + 1.5; // top of the seat

    // support
    supportZ = seatZ-lumber4-lumber8;
    color("purple") {
    translate([1-lumber2        , seatY  , supportZ]) cube([lumber2, seatLenght, lumber8]);
    translate([1+lumber6-lumber2, seatY  , supportZ]) cube([lumber2, seatLenght, lumber8]);
    translate([postXm-lumber2   , seatY  , supportZ]) cube([lumber2, seatLenght, lumber8]);
    translate([postXm+lumber6   , seatY  , supportZ]) cube([lumber2, seatLenght, lumber8]);
    }

    // 4x4 seat
    color("yellow") {
    z = seatZ - lumber4;
    translate([1-.5, seatY      , z]) cube([6, lumber4, lumber4]);
    translate([1-.5, seatY+ 5/12, z]) cube([6, lumber4, lumber4]);
    translate([1-.5, seatY+10/12, z]) cube([6, lumber4, lumber4]);
    }

    // 2x4 back
    backZ = seatZ + 1/12;
    backY = seatY+15/12;
    top4by4 = seatZ+lumber8;
    color("lightgreen") {
    translate([1-.5, backY     , backZ      ]) cube([6, lumber2, lumber4]);
    translate([1-.5, backY+1/12, backZ+ 5/12]) cube([6, lumber2, lumber4]);
    translate([1-.5, backY+2/12, backZ+10/12]) cube([6, lumber2, lumber4]);
    }
}

module 2by8() {
    // 2x8
    y = slabWidth-1-postWidth-trussWidth;
    translate([1-lumber2, 1-trussWidth, postTop-lumber8]) cube([10+2*lumber2, lumber2, lumber8]);
    translate([1, 1+trussDepth, postTop-lumber8]) cube([10, lumber2, lumber8]);
    translate([1-lumber2, slabWidth-1 , postTop-lumber8]) cube([10+2*lumber2, lumber2, lumber8]);
    translate([1-lumber2,            y, postTop-lumber8]) cube([10, lumber2, lumber8]);

    // 2x8 ends
 color("gray")   {translate([1-lumber2,   1, postTop-lumber8]) cube([lumber2, 6, lumber8]);
    translate([11,          1, postTop-lumber8]) cube([lumber2, 6, lumber8]);}

    // ridge board
    translate([   slabLength/2-lumber2/2,         -1-lumber2, beamTop+3.5])
      cube([lumber2, 10, lumber8]);
}

module 6by6() {
    // 4 8ft posts
    translate([1      ,         1, slabHeight]) cube([postWidth,postWidth,postHeight]);
    translate([postX  ,         1, slabHeight]) cube([postWidth,postWidth,postHeight]);
    translate([postX  , postBackY, slabHeight]) cube([postWidth,postWidth,postHeight]);
    translate([1      , postBackY, slabHeight]) cube([postWidth,postWidth,postHeight]);

    // long post in back
    translate([postXm , postBackY, slabHeight])     cube([postWidth,postWidth,postHeight+3]);

    // short support in front
    translate([postXm ,         1, slabHeight+7.5]) cube([postWidth,postWidth,         3.5]);

    // beam on post
    translate([1               ,        -1, postTop]) cube([postWidth,10,postWidth]);
    translate([slabLength-1-postWidth,  -1, postTop]) cube([postWidth,10,postWidth]);

    // 45 degree suport
    translate([1.5,  1, 6]) rotate([0,-45,0]) cube([3,postWidth,postWidth]);
    translate([  8.5,  1, 8]) rotate([0,45,0]) cube([3,postWidth,postWidth]);

    // seat support
    translate([1      , postBackY-1, slabHeight]) cube([postWidth,postWidth,1.5-lumber4]);
    translate([postXm , postBackY-1, slabHeight]) cube([postWidth,postWidth,1.5-lumber4]);
}


module 2by6(){
  // roof rafters
  translate([-1    ,         -1+4/12 , beamTop]) rafter(14,1.5/12,6/12);
    for(y=[1:2:8]) {
    translate([-1    ,         y, beamTop])       rafter(14,1.5/12,6/12);
  }
  translate([-1    ,         9-4/12 , beamTop]) rafter(14,1.5/12,6/12);
}

module rafter(x,y,pitch) {
xMid = x/2;
z    = pitch*(xMid);
h    = .6;

 rotate([90,0,0]) linear_extrude(height = 1.5/12, center = false, convexity = 0, twist = 0, slices = 20,
    scale = 1.0, $fn = 16) polygon([
  [   0,   0] // 0
 ,[xMid,   z] // 1
 ,[   x,   0] // 2
 ,[   x,   h] // 3
 ,[xMid, z+h] // 4
 ,[   0,   h] // 5
 ]);

}
