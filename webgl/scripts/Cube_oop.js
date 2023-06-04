const vertexShaderTxt = `
precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertColor;

varying vec3 fragColor;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main()
{
    fragColor = vertColor;
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
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
const mat4 = glMatrix.mat4;

class World {
  #backgroundColor = [1.0, 1.0, 1.0];
  #canvas;
  gl;
  #program;
  #fragmentShader;
  #vertexShader;
  cubes;

  constructor(
    canvas_id,
    backgroundColor,
    fragmentShaderString,
    vertexShaderString
  ) {
    this.#canvas = document.getElementById(canvas_id);
    this.gl = this.#canvas.getContext("webgl");

    if (!this.gl) {
      alert("webgl not supported");
    }
    this.#backgroundColor = backgroundColor;
    this.prepareBackground(this.#backgroundColor);

    this.#fragmentShader = fragmentShaderString;
    this.#vertexShader = vertexShaderString;

    this.#program = this.gl.createProgram();
    this.prepareShaders();

    this.cubes = [];

    this.prepareUniforms();
  }

  addCube(cube) {
    this.cubes.push(cube);
  }
  prepareBackground(backgroundColor) {
    this.gl.clearColor(...backgroundColor, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
  }

  set setBackgroundColor(backgroundColor) {
    this.#backgroundColor = backgroundColor;
    this.gl.clearColor(...backgroundColor, 1.0);
  }

  set setFragmentShader(shaderString) {
    this.fragmentShader = shaderString;
  }
  set setVertexShader(shaderString) {
    this.#vertexShader = shaderString;
  }

  loadShader(type) {
    let shader_type = null;
    let shaderString = null;

    if (type == "VERTEX") {
      shader_type = this.gl.VERTEX_SHADER;
      shaderString = this.#vertexShader;
      console.log("success");
    } else if (type == "FRAGMENT") {
      shader_type = this.gl.FRAGMENT_SHADER;
      shaderString = this.#fragmentShader;
      console.log("success");
    }

    let shader = this.gl.createShader(shader_type);
    this.gl.shaderSource(shader, shaderString);

    this.gl.compileShader(shader);

    this.gl.attachShader(this.#program, shader);
  }

  prepareShaders() {
    this.loadShader("FRAGMENT");
    this.loadShader("VERTEX");

    //this.gl.detachShader(this.#program, this.#vertexShader);
    //this.gl.detachShader(this.#program, this.#fragmentShader);
    this.gl.linkProgram(this.#program);
    this.gl.validateProgram(this.#program);
  }

  generateCubeVertices(length_a) {
    let half_l = length_a / 2.0;

    let top_4 = [
      -half_l,
      half_l,
      -half_l,
      -half_l,
      half_l,
      half_l,
      half_l,
      half_l,
      half_l,
      half_l,
      half_l,
      -half_l,
    ];

    let bottom_4 = [...top_4];
    for (let i = 1; i < 12; i = i + 3) bottom_4[i] *= -1;
    let left_4 = [
      -half_l,
      half_l,
      half_l,
      -half_l,
      -half_l,
      half_l,
      -half_l,
      -half_l,
      -half_l,
      -half_l,
      half_l,
      -half_l,
    ];
    let right_4 = [...left_4];
    for (let i = 0; i < 12; i = i + 3) right_4[i] *= -1;
    let front_4 = [
      half_l,
      half_l,
      half_l,
      half_l,
      -half_l,
      half_l,
      -half_l,
      -half_l,
      half_l,
      -half_l,
      half_l,
      half_l,
    ];
    let back_4 = [...front_4];
    for (let i = 2; i < 12; i += 3) back_4[i] *= -1;

    return [
      ...top_4,
      ...left_4,
      ...right_4,
      ...front_4,
      ...back_4,
      ...bottom_4,
    ];
  }

  prepareBuffers(cube) {
    const triangleVertexBufferObject = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, triangleVertexBufferObject);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(cube.boxVertices),
      this.gl.STATIC_DRAW
    );

    const cubeIndexBufferObject = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, cubeIndexBufferObject);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(cube.boxIndices),
      this.gl.STATIC_DRAW
    );

    const posAttrLocation = this.gl.getAttribLocation(
      this.#program,
      "vertPosition"
    );

    this.gl.vertexAttribPointer(
      posAttrLocation,
      3,
      this.gl.FLOAT,
      this.gl.FALSE,
      3 * Float32Array.BYTES_PER_ELEMENT,
      0
    );

    const colorAttrLocation = this.gl.getAttribLocation(
      this.#program,
      "vertColor"
    );
    const color_buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, color_buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(cube.colors),
      this.gl.STATIC_DRAW
    );

    this.gl.vertexAttribPointer(
      colorAttrLocation,
      3,
      this.gl.FLOAT,
      this.gl.FALSE,
      0,
      0
    );

    this.gl.enableVertexAttribArray(posAttrLocation);
    this.gl.enableVertexAttribArray(colorAttrLocation);
  }
  prepareUniforms() {
    this.gl.useProgram(this.#program);

    const maxWorldUniformLocation = this.gl.getUniformLocation(
      this.#program,
      "mWorld"
    );
    const maxViewUniformLocation = this.gl.getUniformLocation(
      this.#program,
      "mView"
    );
    const maxProjUniformLocation = this.gl.getUniformLocation(
      this.#program,
      "mProj"
    );

    let viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, [0, 0, -10], [0, 0, 0], [0, 1, 0]);
    let projMatrix = mat4.create();
    mat4.perspective(
      projMatrix,
      glMatrix.glMatrix.toRadian(45),
      this.#canvas.width / this.#canvas.clientHeight,
      0.1,
      1000.0
    );

    let worldMatrix = mat4.create();

    this.gl.uniformMatrix4fv(
      maxWorldUniformLocation,
      this.gl.FALSE,
      worldMatrix
    );
    this.gl.uniformMatrix4fv(maxViewUniformLocation, this.gl.FALSE, viewMatrix);
    this.gl.uniformMatrix4fv(maxProjUniformLocation, this.gl.FALSE, projMatrix);
  }
  run() {
    let rotationMatrix;
    let translationMatrix;
    let angle = 0;
    let self = this;
    const maxWorldUniformLocation = this.gl.getUniformLocation(
      this.#program,
      "mWorld"
    );
    const loop = function () {
      self.gl.clear(self.gl.COLOR_BUFFER_BIT | self.gl.DEPTH_BUFFER_BIT);

      for (let i = 0; i < self.cubes.length; i++) {
        self.prepareBuffers(self.cubes[i]);

        rotationMatrix = new Float32Array(16);
        translationMatrix = new Float32Array(16);

        angle =
          (performance.now() / 1500 / 8) * 2 * Math.PI * self.cubes[i].speed;

        mat4.fromRotation(rotationMatrix, angle, self.cubes[i].rotationMatrix);
        mat4.fromTranslation(
          translationMatrix,
          self.cubes[i].translationMatrix
        );
        mat4.mul(self.cubes[i].worldMatrix, translationMatrix, rotationMatrix);

        self.gl.uniformMatrix4fv(
          maxWorldUniformLocation,
          self.gl.FALSE,
          self.cubes[i].worldMatrix
        );
        self.gl.drawElements(
          self.gl.TRIANGLES,
          self.cubes[i].boxIndices.length,
          self.gl.UNSIGNED_SHORT,
          0
        );
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

class Cube {
  boxVertices;
  boxIndices;
  colors;
  worldMatrix;
  translationMatrix;
  rotationMatrix;
  speed;

  constructor(length_a, colors, rotationMatrix, translationMatrix, speed = 1) {
    this.boxVertices = this.generateCubeVertices(length_a);
    this.colors = [...colors];
    this.speed = speed;
    this.worldMatrix = mat4.create();
    this.rotationMatrix = [...rotationMatrix];
    this.translationMatrix = [...translationMatrix];

    this.boxIndices = [
      // Top
      0, 1, 2, 0, 2, 3,

      // Left
      5, 4, 6, 6, 4, 7,

      // Right
      8, 9, 10, 8, 10, 11,

      // Front
      13, 12, 14, 15, 14, 12,

      // Back
      16, 17, 18, 16, 18, 19,

      // Bottom
      21, 20, 22, 22, 20, 23,
    ];
  }

  generateCubeVertices(length_a) {
    let half_l = length_a / 2.0;

    let top_4 = [
      -half_l,
      half_l,
      -half_l,
      -half_l,
      half_l,
      half_l,
      half_l,
      half_l,
      half_l,
      half_l,
      half_l,
      -half_l,
    ];

    let bottom_4 = [...top_4];
    for (let i = 1; i < 12; i = i + 3) bottom_4[i] *= -1;
    let left_4 = [
      -half_l,
      half_l,
      half_l,
      -half_l,
      -half_l,
      half_l,
      -half_l,
      -half_l,
      -half_l,
      -half_l,
      half_l,
      -half_l,
    ];
    let right_4 = [...left_4];
    for (let i = 0; i < 12; i = i + 3) right_4[i] *= -1;
    let front_4 = [
      half_l,
      half_l,
      half_l,
      half_l,
      -half_l,
      half_l,
      -half_l,
      -half_l,
      half_l,
      -half_l,
      half_l,
      half_l,
    ];
    let back_4 = [...front_4];
    for (let i = 2; i < 12; i += 3) back_4[i] *= -1;

    return [
      ...top_4,
      ...left_4,
      ...right_4,
      ...front_4,
      ...back_4,
      ...bottom_4,
    ];
  }
}

const canvas_id = "canvas_cube";
let world = new World(canvas_id, [1, 0, 1], fragmentShaderTxt, vertexShaderTxt);
world.run();

colors = [
  // R, G, B
  0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,

  0.75, 0.25, 0.5, 0.75, 0.25, 0.5, 0.75, 0.25, 0.5, 0.75, 0.25, 0.5,

  0.25, 0.25, 0.75, 0.25, 0.25, 0.75, 0.25, 0.25, 0.75, 0.25, 0.25, 0.75,

  1.0, 0.0, 0.15, 1.0, 0.0, 0.15, 1.0, 0.0, 0.15, 1.0, 0.0, 0.15,

  0.0, 1.0, 0.15, 0.0, 1.0, 0.15, 0.0, 1.0, 0.15, 0.0, 1.0, 0.15,

  0.5, 0.5, 1.0, 0.5, 0.5, 1.0, 0.5, 0.5, 1.0, 0.5, 0.5, 1.0,
];
colors2 = [...colors];
for (let i = 0; i < colors.length; i += 6) colors2[i] = 1.0;
colors3 = [...colors];
for (let i = 0; i < colors.length; i += 4) colors3[i] = 0.75;

world.addCube(new Cube(1, colors, [0, 1, 1], [-0.5, 3, 3], 3));
world.addCube(new Cube(1, colors2, [1, 1, 0], [2, 0, 0]));
world.addCube(new Cube(2, colors3, [1, 2, 0], [-2, 0, 0], 0.5));

colors4 = [...colors];
for (let i = 2; i < colors.length; i += 3) {
  colors4[i] = 0.75;
  colors[i - 1] = 0.5;
  colors[i - 2] = 0.25;
}
world.addCube(new Cube(2.5, colors4, [1, 2, 0], [3, 3, 2], 0.8));
