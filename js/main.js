//(function(G) {
  /* global vars */
  var t = THREE,
      ASPECT = window.innerWidth / window.innerHeight,
      MOVESPEED = 3,
      ACTUAL_LOOK_SPEED = 1;

  G.meshes = [];

  G.init = function(result) {
    this.clock = new t.Clock();
    this.deltaX = 0;
    this.thetaD = 0;
    this.old_mouseX = 0;

    //this.scene = new t.Scene();
    this.scene = result.scene;

    /* Camera!! */
    this.cam = new t.PerspectiveCamera(60, ASPECT, 0.1, 1000);

    //t.Object3D._threexDomEvent.camera(this.cam);

    this.controls = new t.FirstPersonControls(this.cam);
    this.controls.movementSpeed = MOVESPEED;

    this.scene.add(this.cam);
    this.cam.position.set(7,2,-1);

    /* Lights!! */
    this.light = new t.PointLight(0xffffff, 0.8, 100); 
    this.light.position.set(0, -20, 0);
    this.scene.add(this.light);

    this.renderer = new t.WebGLRenderer({antialias: true});
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    /* necessary event listeners */
    function bind(scope, fn) {
      return function() {
        fn.apply(scope, arguments);
      }
    }
    document.addEventListener('mousemove', bind(this, G.onMouseMove), false);
    window.addEventListener('resize', G.onWindowResize, false);

    /* Action! */
    this.render();
  };

  G.render = function() {
    requestAnimationFrame(G.render);
    G.fixMouseMove();
    G.renderer.render(G.scene, G.cam);
    G.controls.update(G.clock.getDelta());
  };

  /* execution starts from here */
  G.load = function() {
    if(!Detector.webgl) {
      Detector.addGetWebGLMessage(document.body);
      console.log('Could not detect WebGL. Quitting!');
      return;
    }
    new t.SceneLoader().load('scenes/scene-ver4.js', function(result) {
      //console.log('"the" scene js file ', result);
      G.init(result);
    });
  };

  G.onWindowResize = function() {
    G.cam.aspect = window.innerWidth / window.innerHeight;
    G.cam.updateProjectionMatrix();
    G.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  G.onMouseMove = function(event) {
    G.deltaX = event.clientX - G.old_mouseX;
    G.old_mouseX = event.clientX;
  };

  // stop spinning the mouse forever on mouse move
  G.fixMouseMove = function() {
    G.thetaD -= G.deltaX * ACTUAL_LOOK_SPEED;
    var theta = G.thetaD * Math.PI / 180;
    var lookpoint = new t.Vector3(0, 0, 0);
    lookpoint.set(Math.sin(theta), 0, Math.cos(theta));
    lookpoint.addSelf(G.cam.position);
    G.cam.lookAt(lookpoint);
    G.deltaX = 0;
  };
//)(G);
