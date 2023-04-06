// An import statement allows your code to use jscad methods:
const { cube, polyhedron } = require('@jscad/modeling').primitives

// A function declaration that returns geometry
const main = () => {

  const mypoints = [
     [ 10,  10,  0]  // 0
    ,[ 10, -10,  0]  // 1
    ,[-10, -10,  0]  // 2
    ,[-10,  10,  0]  // 3
    ,[  0,   0, 10]  // 4 top
  ] ;
  const myfaces = [
     [0, 1, 4]
    ,[1, 2, 4]
    ,[2, 3, 4]
    ,[3, 0, 4]
    ,[1, 0, 3]
    ,[2, 1, 3]
  ];

  return polyhedron({points: mypoints, faces: myfaces, orientation: 'inward'})
}

// A declaration of what elements in the module (this file) are externally available.
module.exports = { main }
