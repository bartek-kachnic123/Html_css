const vertexShaderTxt = `
    precision mediump float;

    attribute vec2 vertPosition;
    attribute vec3 vertColor;
    
    varying vec3 fragColor;

    void main()
    {
        fragColor = vertColor;
        gl_Position = vec4(vertPosition, 0.0, 1.0);
    }
`;

const fragmentShaderTxt = `
    precision mediump float;
    varying vec3 fragColor;

    void main()
    {
        gl_FragColor  = vec4(fragColor,1.0);
    }
`;

const create_figure = function(canvas_id, triangleVert, num_row, triangle_option='triangle') {
  let canvas = document.getElementById(canvas_id);
  let gl = canvas.getContext("webgl");

  if (!gl) alert("Webgl not supported!");

  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let vertexShader = gl.createShader(gl.VERTEX_SHADER);
  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, vertexShaderTxt);
  gl.shaderSource(fragmentShader, fragmentShaderTxt);

  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);

  let program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);

  gl.validateProgram(program);

  let triangleVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(triangleVert),
    gl.STATIC_DRAW
  );

  const posAttrLocation = gl.getAttribLocation(program, "vertPosition");
  const colorAttrLocation = gl.getAttribLocation(program, "vertColor");

  gl.vertexAttribPointer(
    posAttrLocation,
    2,
    gl.FLOAT,
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.vertexAttribPointer(
    colorAttrLocation,
    3,
    gl.FLOAT,
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,
    2 * Float32Array.BYTES_PER_ELEMENT
  );

  gl.enableVertexAttribArray(posAttrLocation);
  gl.enableVertexAttribArray(colorAttrLocation);

  gl.useProgram(program);

  if (triangle_option === 'triangle')
    gl.drawArrays(gl.TRIANGLES, 0, num_row);
  else if (triangle_option == 'triangle_fan')
    gl.drawArrays(gl.TRIANGLE_FAN, 0, num_row);
}

const initTriangle = function() {

  const canvas_id = 'canvas_triangle';

  let triangleVert = [
    0.0, 0.5, 1.0, 0.0, 0.0, // X Y R G B
    -0.5, -0.5, 0.0, 1.0, 0.0, 
    0.5, -0.5, 0.0, 0.0, 1.0,
  ];

  const num_row = 3;

  create_figure(canvas_id, triangleVert, num_row);
}

const initSquare = function() {
  const canvas_id = 'canvas_square';
  let triangleVert = [
    // Triangle 1
   -0.5, -0.5, 1.0, 0.0, 0.0, // X Y R G B
   -0.5, 0.5, 0.0, 1.0, 0.0, 
   0.5, -0.5, 0.0, 0.0, 1.0,
    // Triangle 2
   -0.5, 0.5, 0.0, 1.0, 0.0, 
   0.5, -0.5, 0.0, 0.0, 1.0,
   0.5, 0.5, 1.0, 0.0, 0.0,
 ];
 const num_row = 6;

 create_figure(canvas_id, triangleVert, num_row);

}

const initHexagon = function() {
  const canvas_id = 'canvas_hexagon';
  let triangleVert = [
    // X Y R G B
    0.0, 0.0, 0.0, 1.0, 1.0, // center
   
   -0.5, 0.0,  1.0, 0.0, 0.0, 
   -0.25, 0.5,  1.0, 1.0, 0.0, 
   0.25, 0.5,  0.0, 0.0, 1.0,
    
   0.5, 0.0,  1.0, 1.0, 0.0, 
   0.25, -0.5, 1.0, 0.0, 1.0,
   -0.25, -0.5, 1.0, 0.0, 0.0,
   
   -0.5, 0.0, 1.0, 0.0, 0.0, // end
  ]
  const num_row = 8;
  create_figure(canvas_id, triangleVert, num_row, 'triangle_fan')
}

const initCanvas = function () {
  initTriangle();
  initSquare();
  initHexagon();
};

