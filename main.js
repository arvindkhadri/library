/*************************************
 * Controller
 */
function Controller() {
  this.view = new View(this);
  this.kin = new Kinetic_3d("myCanvas");
  this.kin.setShaderProgram("TEXTURE_DIRECTIONAL_LIGHTING");
  this.model = new Model(this);

  this.attachListeners();

  var sources = {
    crate: "crate.jpg",
    metalFloor: "brick.jpg",
    metalWall: "brick.jpg",
    ceiling: "brick.jpg",
    book : "brown066.jpg"
  };

  this.mouseDownPos = null;
  this.mouseDownPitch = 0;
  this.mouseDownYaw = 0;

  var that = this;
  this.loadTextures(sources, function() {
    that.kin.setDrawStage(function() {
      that.view.drawStage();
    });

    that.kin.startAnimation();
  });
}

Controller.prototype.loadTextures = function(sources, callback) {
  var kin = this.kin;
  var context = kin.getContext();
  var textures = this.model.textures;
  var loadedImages = 0;
  var numImages = 0;
  for (var src in sources) {
    // anonymous function to induce scope
    (function() {
      var key = src;
      numImages++;
      textures[key] = context.createTexture();
      textures[key].image = new Image();
      textures[key].image.onload = function() {
        kin.initTexture(textures[key]);
        console.log(textures[key].image.src);
        if (++loadedImages >= numImages) {
          callback();
        }
      };

      textures[key].image.src = sources[key];
    })();
  }
};

Controller.prototype.getMousePos = function(evt) {
  return {
    x: evt.clientX,
      y: evt.clientY
  };
};

Controller.prototype.handleMouseDown = function(evt) {
  var camera = this.model.camera;
  this.mouseDownPos = this.getMousePos(evt);
  this.mouseDownPitch = camera.pitch;
  this.mouseDownYaw = camera.yaw;
  console.log(evt);
  if(evt.clientX >= 630 && evt.clientX <= 900 && 
      evt.clientY >= 425 && evt.clientY <= 470) {
        //alert("test");
        window.open('http://ddg.gg');
      }
};

Controller.prototype.handleMouseMove = function(evt) {
  var mouseDownPos = this.mouseDownPos;
  var kin = this.kin;
  if (mouseDownPos !== null) {
    var mousePos = this.getMousePos(evt);

    // update pitch
    var yDiff = mousePos.y - mouseDownPos.y;
    this.model.camera.pitch = this.mouseDownPitch + yDiff / kin.getCanvas().height;

    // update yaw
    var xDiff = mousePos.x - mouseDownPos.x;
    this.model.camera.yaw = this.mouseDownYaw + xDiff / kin.getCanvas().width;
  }
};

Controller.prototype.handleKeyDown = function(evt) {
  var keycode = ((evt.which) || (evt.keyCode));
  var model = this.model;
  switch (keycode) {
    case 37:
      // left key
      model.sideMovement = model.LEFT;
      break;
    case 38:
      // up key
      model.straightMovement = model.FORWARD;
      break;
    case 39:
      // right key
      model.sideMovement = model.RIGHT;
      break;
    case 40:
      // down key
      model.straightMovement = model.BACKWARD;
      break;
  }
};

Controller.prototype.handleKeyUp = function(evt) {
  var keycode = ((evt.which) || (evt.keyCode));
  var model = this.model;
  switch (keycode) {
    case 37:
      // left key
      model.sideMovement = model.STILL;
      break;
    case 38:
      // up key
      model.straightMovement = model.STILL;
      break;
    case 39:
      // right key
      model.sideMovement = model.STILL;
      break;
    case 40:
      // down key
      model.straightMovement = model.STILL;
      break;
  }
};

Controller.prototype.attachListeners = function() {
  var kin = this.kin;
  var that = this;
  kin.getCanvas().addEventListener("mousedown", function(evt) {
    that.handleMouseDown(evt);
  }, false);

  kin.getCanvas().addEventListener("mousemove", function(evt) {
    that.handleMouseMove(evt);
  }, false);

  document.addEventListener("mouseup", function(evt) {
    that.mouseDownPos = null;
  }, false);

  document.addEventListener("mouseout", function(evt) {
    // same as mouseup functionality
    that.mouseDownPos = null;
  }, false);

  document.addEventListener("keydown", function(evt) {
    that.handleKeyDown(evt);
  }, false);

  document.addEventListener("keyup", function(evt) {
    that.handleKeyUp(evt);
  }, false);
};

/*************************************
 * Model
 */
function Model(controller) {
  this.controller = controller;
  this.cubeBuffers = {};
  this.bookBuffers = {};
  this.floorBuffers = {};
  this.wallBuffers = {};
  this.angle = 0;
  this.textures = {};
  this.cratePositions = [];
  this.bookPositions = [];

  // movements
  this.STILL = "STILL";
  this.FORWARD = "FORWARD";
  this.BACKWARD = "BACKWARD";
  this.LEFT = "LEFT";
  this.RIGHT = "RIGHT";

  // camera
  this.camera = {
    x: 0,
    y: 1.5,
    z: 5,
    pitch: 0,
    yaw: 0
  };

  this.straightMovement = this.STILL;
  this.sideMovement = this.STILL;
  this.speed = 8; // units per second	
  this.initBuffers();
  //this.initCratePositions();
  this.initStaticCratePosition();
  this.initStaticBookPosition();
}

Model.prototype.initCratePositions = function() {
  var crateRange = 45;
  // randomize 20 floor crates
  for (var n = 0; n < 20; n++) {
    var cratePos = {};
    cratePos.x = (Math.random() * crateRange * 2) - crateRange;
    cratePos.y = 0;
    cratePos.z = (Math.random() * crateRange * 2) - crateRange;
    cratePos.rotationY = Math.random() * Math.PI * 2;
    this.cratePositions.push(cratePos);

    if (Math.round(Math.random() * 3) == 3) {
      var stackedCratePosition = {};
      stackedCratePosition.x = cratePos.x;
      stackedCratePosition.y = 2.01;
      stackedCratePosition.z = cratePos.z;
      stackedCratePosition.rotationY = cratePos.rotationY + ((Math.random() * Math.PI / 8) - Math.PI / 16);
      this.cratePositions.push(stackedCratePosition);
    }
  }
};
Model.prototype.initStaticCratePosition = function() {
  var cratePos = {};
  cratePos.x = 1;
  cratePos.y = 0;
  cratePos.z = -15;
  cratePos.rotationY = 6.1; //Math.random() * Math.PI * 2;
  this.cratePositions.push(cratePos);
};

Model.prototype.initStaticBookPosition = function() {
  var bookPos = {};
  bookPos.x = 1 ;
  bookPos.y = 1.01;
  bookPos.z = -15;
  bookPos.rotationY = Math.random() * Math.PI * 2;
  this.bookPositions.push(bookPos);
};

Model.prototype.initCubeBuffers = function() {
  var kin = this.controller.kin;
  this.cubeBuffers.positionBuffer = kin.createArrayBuffer([    
      -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1, // Front face    
      -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1, // Back face    
      -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1, // Top face    
      -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, // Bottom face    
      1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, // Right face    
      -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1 // Left face
      ]);

  this.cubeBuffers.normalBuffer = kin.createArrayBuffer([    
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, // Front face    
      0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, // Back face   
      0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, // Top face    
      0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, // Bottom face    
      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // Right face    
      -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0 // Left face
      ]);

  this.cubeBuffers.textureBuffer = kin.createArrayBuffer([    
      0, 0, 1, 0, 1, 1, 0, 1, // Front face   
      1, 0, 1, 1, 0, 1, 0, 0, // Back face   
      0, 1, 0, 0, 1, 0, 1, 1, // Top face    
      1, 1, 0, 1, 0, 0, 1, 0, // Bottom face   
      1, 0, 1, 1, 0, 1, 0, 0, // Right face    
      0, 0, 1, 0, 1, 1, 0, 1 // Left face
      ]);

  this.cubeBuffers.indexBuffer = kin.createElementArrayBuffer([
      0, 1, 2, 0, 2, 3, // Front face
      4, 5, 6, 4, 6, 7, // Back face
      8, 9, 10, 8, 10, 11, // Top face
      12, 13, 14, 12, 14, 15, // Bottom face
      16, 17, 18, 16, 18, 19, // Right face
      20, 21, 22, 20, 22, 23 // Left face
      ]);
};

Model.prototype.initBookBuffers = function() {
  var kin = this.controller.kin;
  this.bookBuffers.positionBuffer = kin.createArrayBuffer([
      //15, 2.01, -15, 17, 2.01, -15, 17, 2.0, -15, 15, 2, -15
      // front face
      // -0.5, 0, -0.5,
      // -0.5, 0, 0.5,
      // -0.5, 0.1, 0.5,
      // -0.5, 0.1, -0.5,
      // // back face
      // 0.5, 0, -0.5,
      // 0.5, 0, 0.5,
      // 0.5, 0.1, 0.5,
      // 0.5, 0.1, -0.5,
      // // top face
      // -0.5, 0.1, -0.5, 
      // -0.5, 0.1, 0.5, 
      // 0.5, 0.1, 0.5, 
      // 0.5, 0.1, -0.5,
      //bottom face
      -0.5, 0, -0.5, 
      -0.5, 0, 0.5, 
      0.5, 0, 0.5, 
      0.5, 0, -0.5,
      // right face
      // 0.5, 0, 0.5,
      // -0.5, 0, 0.5,
      // -0.5, 0.1, 0.5,
      // 0.5, 0.1, 0.5,
      // // left face
      //  0.5, 0, -0.5
      //  -0.5, 0 , 0.5,
      // -0.5, 0.1, -0.5,
      // -0.5, 0.1, 0.5
      ]);
  this.bookBuffers.textureBuffer = kin.createArrayBuffer([
      0, 0.1, 0, 0, 0.1, 0, 0.1, 0.1
      ]);

  this.bookBuffers.indexBuffer = kin.createElementArrayBuffer([
      0, 1, 2, 0, 2, 3
      ]);

  // book normal points upwards
  this.bookBuffers.normalBuffer = kin.createArrayBuffer([
      -1, 1, 0, 
      0, 1, 0, 
      0, 1, 0, 
      0, 1, 0
      ]);

};

Model.prototype.initFloorBuffers = function() {
  var kin = this.controller.kin;
  this.floorBuffers.positionBuffer = kin.createArrayBuffer([
      -50, 0, -50, -50, 0, 50, 50, 0, 50, 50, 0, -50
      ]);

  this.floorBuffers.textureBuffer = kin.createArrayBuffer([
      0, 25, 0, 0, 25, 0, 25, 25
      ]);

  this.floorBuffers.indexBuffer = kin.createElementArrayBuffer([
      0, 1, 2, 0, 2, 3
      ]);

  // floor normal points upwards
  this.floorBuffers.normalBuffer = kin.createArrayBuffer([
      -1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0
      ]);
};

Model.prototype.initWallBuffers = function() {
  var kin = this.controller.kin;
  this.wallBuffers.positionBuffer = kin.createArrayBuffer([
      -50, 5, 0, 50, 5, 0, 50, -5, 0, -50, -5, 0
      ]);

  this.wallBuffers.textureBuffer = kin.createArrayBuffer([
      0, 0, 25, 0, 25, 1.5, 0, 1.5
      ]);

  this.wallBuffers.indexBuffer = kin.createElementArrayBuffer([
      0, 1, 2, 0, 2, 3
      ]);

  // floor normal points upwards
  this.wallBuffers.normalBuffer = kin.createArrayBuffer([
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1
      ]);
};

Model.prototype.initBuffers = function() {
  this.initCubeBuffers();
  this.initBookBuffers();
  this.initFloorBuffers();
  this.initWallBuffers();
};

Model.prototype.updateCameraPos = function() {
  var kin = this.controller.kin;
  if (this.straightMovement != this.STILL) {
    var direction = this.straightMovement == this.FORWARD ? -1 : 1;
    var distEachFrame = direction * this.speed * kin.getTimeInterval() / 1000;
    this.camera.z += distEachFrame * Math.cos(this.camera.yaw);
    this.camera.x += distEachFrame * Math.sin(this.camera.yaw);
  }

  if (this.sideMovement != this.STILL) {
    var direction = this.sideMovement == this.RIGHT ? 1 : -1;
    var distEachFrame = direction * this.speed * kin.getTimeInterval() / 1000;
    this.camera.z += distEachFrame * Math.cos(this.camera.yaw + Math.PI / 2);
    this.camera.x += distEachFrame * Math.sin(this.camera.yaw + Math.PI / 2);
  }
};

/*************************************
 * View
 */
function View(controller) {
  this.controller = controller;
  this.canvas = document.getElementById("myCanvas");
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
}

View.prototype.drawFloor = function() {
  var controller = this.controller;
  var kin = controller.kin;
  var model = controller.model;
  var floorBuffers = model.floorBuffers;

  kin.save();
  kin.translate(0, -1.1, 0);
  kin.pushPositionBuffer(floorBuffers);
  kin.pushNormalBuffer(floorBuffers);
  kin.pushTextureBuffer(floorBuffers, model.textures.metalFloor);
  kin.pushIndexBuffer(floorBuffers);
  kin.drawElements(floorBuffers);
  kin.restore();
};

View.prototype.drawCeiling = function() {
  var controller = this.controller;
  var kin = controller.kin;
  var model = controller.model;
  var floorBuffers = model.floorBuffers;

  kin.save();
  kin.translate(0, 8.9, 0);
  // use floor buffers with ceiling texture
  kin.pushPositionBuffer(floorBuffers);
  kin.pushNormalBuffer(floorBuffers);
  kin.pushTextureBuffer(floorBuffers, model.textures.ceiling);
  kin.pushIndexBuffer(floorBuffers);
  kin.drawElements(floorBuffers);
  kin.restore();
};

View.prototype.drawCrates = function() {
  var controller = this.controller;
  var kin = controller.kin;
  var model = controller.model;
  var cubeBuffers = model.cubeBuffers;

  for (var n = 0; n < model.cratePositions.length; n++) {
    kin.save();
    var cratePos = model.cratePositions[n];
    kin.translate(cratePos.x, cratePos.y, cratePos.z);
    kin.rotate(cratePos.rotationY, 0, 1, 0);
    kin.pushPositionBuffer(cubeBuffers);
    kin.pushNormalBuffer(cubeBuffers);
    kin.pushTextureBuffer(cubeBuffers, model.textures.crate);
    kin.pushIndexBuffer(cubeBuffers);
    kin.drawElements(cubeBuffers);
    kin.restore();
  }
};

View.prototype.drawBook = function() {
  var controller = this.controller;
  var kin = controller.kin;
  var model = controller.model;
  var bookBuffers = model.bookBuffers;

  for (var n = 0; n < model.bookPositions.length; n++) {
    kin.save();
    var bookPos = model.bookPositions[n];
    kin.translate(bookPos.x, bookPos.y, bookPos.z);
    kin.rotate(bookPos.rotationY, 0, 1, 0);
    kin.pushPositionBuffer(bookBuffers);
    kin.pushNormalBuffer(bookBuffers);
    //console.log(model.textures.book);
    kin.pushTextureBuffer(bookBuffers, model.textures.book);
    kin.pushIndexBuffer(bookBuffers);
    kin.drawElements(bookBuffers);
    kin.restore();
  }
};

/*View.prototype.drawBook = function() {
  var canvas = document.getElementById('myCanvas');
  var gl = canvas.getContext("experimental-webgl");

  var image = new Image();
  image.src = "book.png";//"http://someimage/on/our/server";  // MUST BE SAME DOMAIN!!!
  image.onload = function() {
  var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

// provide texture coordinates for the rectangle.
var texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
1.0,  1.0, 
0.0,  1.0, 
0.0,  0.0, 
1.0,  1.0, 
0.0,  0.0, 
1.0,  0.0]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(texCoordLocation);
gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

var texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

}
};*/

View.prototype.drawWalls = function() {
  var controller = this.controller;
  var kin = controller.kin;
  var model = controller.model;
  var wallBuffers = model.wallBuffers;
  var metalWallTexture = model.textures.metalWall;

  kin.save();
  kin.translate(0, 3.9, -50);
  kin.pushPositionBuffer(wallBuffers);
  kin.pushNormalBuffer(wallBuffers);
  kin.pushTextureBuffer(wallBuffers, metalWallTexture);
  kin.pushIndexBuffer(wallBuffers);
  kin.drawElements(wallBuffers);
  kin.restore();

  kin.save();
  kin.translate(0, 3.9, 50);
  kin.rotate(Math.PI, 0, 1, 0);
  kin.pushPositionBuffer(wallBuffers);
  kin.pushNormalBuffer(wallBuffers);
  kin.pushTextureBuffer(wallBuffers, metalWallTexture);
  kin.pushIndexBuffer(wallBuffers);
  kin.drawElements(wallBuffers);
  kin.restore();

  kin.save();
  kin.translate(50, 3.9, 0);
  kin.rotate(Math.PI * 1.5, 0, 1, 0);
  kin.pushPositionBuffer(wallBuffers);
  kin.pushNormalBuffer(wallBuffers);
  kin.pushTextureBuffer(wallBuffers, metalWallTexture);
  kin.pushIndexBuffer(wallBuffers);
  kin.drawElements(wallBuffers);
  kin.restore();

  kin.save();
  kin.translate(-50, 3.9, 0);
  kin.rotate(Math.PI / 2, 0, 1, 0);
  kin.pushPositionBuffer(wallBuffers);
  kin.pushNormalBuffer(wallBuffers);
  kin.pushTextureBuffer(wallBuffers, metalWallTexture);
  kin.pushIndexBuffer(wallBuffers);
  kin.drawElements(wallBuffers);
  kin.restore();
};

View.prototype.drawStage = function() {
  var controller = this.controller;
  var kin = controller.kin;
  var model = controller.model;
  var view = controller.view;
  var camera = model.camera;
  model.updateCameraPos();
  kin.clear();
  // set field of view at 45 degrees
  // set viewing range between 0.1 and 100 units away.
  kin.perspective(45, 0.1, 150.0);
  kin.identity();

  kin.rotate(-camera.pitch, 1, 0, 0);
  kin.rotate(-camera.yaw, 0, 1, 0);
  kin.translate(-camera.x, -camera.y, -camera.z);

  // enable lighting
  kin.enableLighting();
  kin.setAmbientLighting(0.5, 0.5, 0.5);
  kin.setDirectionalLighting(-0.25, -0.25, -1, 0.8, 0.8, 0.8);

  view.drawFloor();
  view.drawWalls();
  view.drawCeiling();
  view.drawCrates();
  view.drawBook();
};

