var THREE = require('three'),
    PNG   = require('pngjs').PNG,
    GL    = require('gl'),
    jsdom = require('jsdom'),
    express = require('express');

var app = express();

app.get('/webgl', function(req, res) {
  var window = jsdom.jsdom().defaultView;
  var document = window.document;

  global.window = window;
  global.document = document;

  var width = 600, height = 400, path = 'out2.png', png = new PNG({ width: width, height: height });
  var scene = new THREE.Scene();

  var viewAngle = 45, aspect = width / height, near = 0.1, far = 100;

  var camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
  scene.add(camera);
  camera.position.set(0, 2, 2);

  camera.lookAt(scene.position);

  var renderer = new THREE.WebGLRenderer({
    antialias: true,
    width: 0,
    height: 0,
    context: GL(width, height, { preserveDrawingBuffer: true })
  });

  var geometry = new THREE.TorusKnotBufferGeometry(10, 3, 100, 16);
  var material = new THREE.MeshPhongMaterial({
    color: 0x156289,
    emissive: 0x072534,
    side: THREE.DoubleSide,
    shading: THREE.FlatShading
  });
  //var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  var torusKnot = new THREE.Mesh( geometry, material );
  //scene.add( torusKnot );

  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.ShaderMaterial();
  var vec4 = new THREE.Vector4(1.0, 0.0, 0.0, 1.0);

  material.vertexShader = 'void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }';
  material.fragmentShader = 'uniform vec4 solidColor; void main() { gl_FragColor = solidColor; }';
  material.uniforms = { solidColor: { type: 'v4', value: vec4 } };
  var cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  var rtTexture = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat
  });

  renderer.render(scene, camera, rtTexture, true);

  gl = renderer.getContext();
  var pixels = new Uint8Array(4 * width * height);

  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, png.data);

  /*var data = new Buffer(pixels);
  var stride = width * 4;
  var tmp = new Buffer(stride);

  for(var i = 0, j = height - 1; i < j; i++, j--) {
    var start = i * stride;
    var end = j * stride;

    data.copy(tmp, 0, start, start + stride);
    data.copy(data, start, end, end + stride);
    tmp.copy(data, end);
  }

  png.data = data;*/

  /*
  for(var j = 0; j < height; j++) {
    for(var i = 0; i < width; i++) {
      var k = j * width + i;
      
      var r = pixels[4*k];
      var g = pixels[4*k + 1];
      var b = pixels[4*k + 2];
      var a = pixels[4*k + 3];

      var m = (height - j + i) * width + i;
      png.data[4*m]     = r;
      png.data[4*m + 1] = g;
      png.data[4*m + 2] = b;
      png.data[4*m + 3] = a;
    }
  }*/
  res.setHeader('content-type', 'image/png');
  png.pack().pipe(res);
});

app.listen(8080);
