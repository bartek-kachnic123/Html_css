const initTriangle = function() {
    let canvas = document.getElementById('canvas_triangle');
    let gl = canvas.getContext('webgl');

    if (!gl)
        alert("Webgl not supported!");

    gl.clearColor(0.8, 0.6, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};


const initCanvas = function() {
    initTriangle();
}