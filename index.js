var cam, scene, renderer, controls;
var geometry, material;
var mouse = {x:0, y:0};
var t = THREE;
var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    ASPECT = WIDTH / HEIGHT;
var MOVESPEED = 500;
var LOOKSPEED = 0.05;

var map = {
            0: [[0,0], [100, 0], [100, 200], [0, 200]],
            1: [[100, 0], [200, 0], [200, 200], [100, 200]]
          };

var walls = {
  front: {x: -50, y: 0, z: -1000},
  back: {x: -50, y: 0, z: 1000},
  left: {x: -1050, y: 0, z: 0},
  right: {x: 950, y: 0, z: 0}
};

var walls2 = {
  front: {x: 2000, y: 0, z: -1000},
  back: {x: 2000, y: 0, z: 1000},
  left: {x: 1050, y: 0, z: 0},
  right: {x: 2950, y: 0, z: 0}
};

//init();
//animate();

function init() {

  if(!Detector.webgl) {
    Detector.addGetWebGLMessage(document.body);
  }
  clock = new t.Clock();
  cam = new t.PerspectiveCamera(60, ASPECT, 1, 10000); // Field Of Viw, aspect ratio, near, far
  cam.position.z = 700;
  cam.position.y = -100;
  cam.lookAt(new THREE.Vector3(-20, 0, -400));

  t.Object3D._threexDomEvent.camera(cam);
  // Camera moves with mouse, flies around with WASD/arrow keys
  controls = new t.FirstPersonControls(cam); // Handles camera control
  controls.movementSpeed = MOVESPEED; // How fast the player can walk around
  controls.lookSpeed = LOOKSPEED; // How fast the player can look around with the mouse
  controls.lookVertical = false; //   Don't allow the player to look up or down. This is a temporary fix to keep people from flying
  controls.noFly = false; // Don't allow hitting R or F to go up or down

  var UNITSIZE = 100;
  var units = 1;

  scene = new t.Scene();
  scene.add(cam);

  /* Room 1 */
  var floor = createMesh([2000, 10, 2000], 'Library_Ceiling.jpg');
  floor.position.x = -50;
  floor.position.y = -650;
  scene.add(floor);

  var ceiling = createMesh([2000, 10, 2000], 'NYC_ceiling.jpg');
  ceiling.position.x = -50;
  ceiling.position.y = 650;
  scene.add(ceiling);

  var front_wall = createMesh([2000, 1300, 10], 'library_long_image.jpg');
  front_wall.position.x = walls.front.x;
  front_wall.position.y = walls.front.y;
  front_wall.position.z = walls.front.z;
  scene.add(front_wall);

  var back_wall = createMesh([2000, 1300, 10], 'library_long_image.jpg');
  back_wall.position.x = walls.back.x;
  back_wall.position.y = walls.back.y;
  back_wall.position.z = walls.back.z;
  scene.add(back_wall);

  var left_wall = createMesh([2000, 1300, 10], 'painting.JPG');
  left_wall.position.x = walls.left.x;
  left_wall.position.y = walls.left.y;
  left_wall.position.z = walls.left.z;
  left_wall.rotation.y = 1.57;
  scene.add(left_wall);

  var right_wall = createMesh([2000, 1300, 10], 'library_long_image.jpg');
  right_wall.position.x = walls.right.x;
  right_wall.position.y = walls.right.y;
  right_wall.position.z = walls.right.z;
  right_wall.rotation.y = -1.57;
  scene.add(right_wall);

  var crate = createMesh([300, 300, 300], 'frame.jpg');
  crate.position.z = -100;
  crate.position.y = -500;
  crate.rotation.y = Math.random() * Math.PI;
  scene.add(crate);

  var book_faces = ['0xFFFFFF', 'gitanjali.jpg', '0xFFFFFF', '0xFFFFFF', 'gitanjali.jpg', 'gitanjali.jpg'];
  var book = createMesh([100, 180, 20], book_faces, [1, 1, 1]);
  book.position.y = -340;
  book.position.z = -100;
  book.rotation.x = -1.57;
  scene.add(book);

  book.on('click',function(e) {
    book.rotation.x = -1.57;
    book.position.y = -340;
    window.open("http://www.archive.org/stream/gitanjalisongoff00tagouoft#page/n9/mode/2up");
  });

  book.on('mouseover', function(e) {
    book.rotation.x = 0;
    book.position.y = -230;
  });

  drawRadar();
  /* Room 2 */
var floor2 = createMesh([2000, 10, 2000], 'Library_Ceiling.jpg');
  floor2.position.x = 2000;
  floor2.position.y = -650;
  scene.add(floor2);

  var ceiling2 = createMesh([2000, 10, 2000], 'NYC_ceiling.jpg');
  ceiling2.position.x = 2000;
  ceiling2.position.y = 650;
  scene.add(ceiling2);

  var front_wall2 = createMesh([2000, 1300, 10], 'library_long_image.jpg');
  front_wall2.position.x = walls2.front.x;
  front_wall2.position.y = walls2.front.y;
  front_wall2.position.z = walls2.front.z;
  scene.add(front_wall2);

  var back_wall2 = createMesh([2000, 1300, 10], 'library_long_image.jpg');
  back_wall2.position.x = walls2.back.x;
  back_wall2.position.y = walls2.back.y;
  back_wall2.position.z = walls2.back.z;
  scene.add(back_wall2);

  var left_wall2 = createMesh([2000, 1300, 10], 'painting.JPG');
  left_wall2.position.x = walls2.left.x;
  left_wall2.position.y = walls2.left.y;
  left_wall2.position.z = walls2.left.z;
  left_wall2.rotation.y = 1.57;
  scene.add(left_wall2);

  var right_wall2 = createMesh([2000, 1300, 10], 'library_long_image.jpg');
  right_wall2.position.x = walls2.right.x;
  right_wall2.position.y = walls2.right.y;
  right_wall2.position.z = walls2.right.z;
  right_wall2.rotation.y = -1.57;
  scene.add(right_wall2);

  /* Render the scene */
  renderer = new t.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize, false);

  document.getElementById('radar').addEventListener('click', onRadarClick, false);

  if(GameShim.supports.pointerLock) {
    document.documentElement.requestPointerLock();
  }
}

function animate() {
  // note: three.js includes requestAnimationFrame shim
  requestAnimationFrame(animate);
  renderer.render(scene, cam);
  drawMap();
  var delta = clock.getDelta();
  controls.update(delta);
}

/* creates and returns a cube mesh with a texture
 * Parameters:
 * @dimensions: array of cube dimensions
 * @materials: image url; array of different materials for each
 *             face, or a single image for all faces
 * @segment_dimensions: see http://mrdoob.github.com/three.js/docs/51/#CubeGeometry
 * TODO: should be able to handle other geometries also(plane, line, point, polygons etc.)
 */
function createMesh(dimensions, textures, segment_dimensions) {
  var w = dimensions[0],
      h = dimensions[1],
      d = dimensions[2];

  segment_dimensions = segment_dimensions ? segment_dimensions : [0, 0, 0];
  var sW = segment_dimensions[0] || undefined,
      sH = segment_dimensions[1] || undefined,
      sD = segment_dimensions[2] || undefined;

  var geometry, material, materials = [], material_params;

  if(!(textures instanceof Array)) {
    if(textures.match(/^0x/)) {
      material_params = {color: parseInt(textures, 16)};
    }
    else {
      material_params = {map: t.ImageUtils.loadTexture(textures)};
    }
    geometry = new t.CubeGeometry(w, h, d, sW, sH, sD);
    material = new t.MeshBasicMaterial(material_params);
  }
  else {
    for(var i in textures) {
      if(textures[i].match(/^0x/)) {
        material_params = {color: parseInt(textures[i], 16)};
      }
      else {
        material_params = {map: t.ImageUtils.loadTexture(textures[i])};
      }
      var mesh_mat = new t.MeshBasicMaterial(material_params);
      materials.push(mesh_mat);
    }
    geometry = new t.CubeGeometry(w, h, d, sW, sH, sD, materials);
    material = new t.MeshFaceMaterial();
  }

  var mesh = new t.Mesh(geometry, material);
  return mesh;
}

function onDocumentMouseMove(e) {
  e.preventDefault();
  mouse.x = (e.clientX / WIDTH) * 2 - 1;
  mouse.y = - (e.clientY / HEIGHT) * 2 + 1;
}

function onWindowResize() {
  cam.aspect = window.innerWidth / window.innerHeight;
  cam.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function drawRadar() {
  var elem = document.getElementById('radar');
  elem.style['position'] = 'absolute';
  elem.style['bottom'] = '60px';
  elem.style['left'] = '10px';

  drawMap();
}

//TODO: find a better way to represent and draw the map
function drawMap() {
  var context = document.getElementById('radar').getContext('2d');

    
//    context.translate(0,0);

  context.clearRect(0, 0, 200, 200);

// context.translate(100,200);
//     context.rotate(Math.PI/2);
  for(var z in map)
      {
        for(var i = 0; i < map[z].length; i++) {
          context.beginPath();
          context.moveTo(map[z][i][0], map[z][i][1]);
    if(i == map[z].length - 1) {
      context.lineTo(map[z][0][0], map[z][0][1]);
    }
    else {
      context.lineTo(map[z][i+1][0], map[z][i+1][1]);
    }
    context.strokeStyle = 'red';
    context.stroke();
  } 
          }
  drawPlayerInMap();
}

//FIXME: dirty hack!!! find a better way to do this
function drawPlayerInMap() {
  //console.log(cam.position.x, cam.position.z);
  //FIXME: what is this? :o
  var x = (cam.position.x < 0) ? ((1050 - Math.abs(cam.position.x)) * 0.067) : (cam.position.x == 0) ? 66.67: (100 + (cam.position.x * 0.067));
  var y = (cam.position.z < 0) ? ((1050 - Math.abs(cam.position.z)) * 0.067) : (cam.position.z == 0) ? 66.67: (100 + (cam.position.z * 0.067));
  //var y = (cam.position.z / 10);
  //console.log(x, y);
  //x = (x > 200) ? 200 : (x < 0) ? 0 : x;
  //y = (y > 200) ? 200 : (y < 0) ? 0 : y;

  var context = document.getElementById('radar').getContext('2d');
  context.beginPath();
  context.arc(x, y, 5, 0, Math.PI*2, true);
  context.fillStyle = 'blue';
  context.fill();
}

function onRadarClick(event) {
  console.log(event);
  var x = event.clientX;
  if(x < 66.67) {
    x = (x * 15) - 1050;
  }
  else {
    x = x * 15;
  }
  var y = event.clientY - 200;
  if(y < 66.67) {
    y = (y * 15) - 1050;
  }
  else {
    y = y * 15;
  }
  //console.log(x, y);
  cam.position.x = x;
  cam.position.z = y;
}
