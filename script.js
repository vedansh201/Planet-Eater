
var scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000);

var wrap = document.getElementById('canvas-wrap');
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 9)

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
wrap.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enableZoom = false; 
controls.update();


var amb = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(amb);

var dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
dirLight.position.set(5, 8, 5);
dirLight.castShadow = true
scene.add(dirLight);


var starGeo = new THREE.BufferGeometry();
var starCount = 400;
var starPositions = [];
for (var i = 0; i < starCount; i++) {
  starPositions.push((Math.random() - 0.5) * 70);
  starPositions.push((Math.random() - 0.5) * 50);
  starPositions.push((Math.random() - 0.5) * 70);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
var starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.12 });
var stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

var beltCanvas = document.createElement('canvas');
beltCanvas.width = 512;
beltCanvas.height = 128;
var bctx = beltCanvas.getContext('2d');
bctx.fillStyle = "#1b1350";
bctx.fillRect(0, 0, 512, 128);
for (var i = 0; i < 500; i++) {
  var bx = Math.random() * 512;
  var by = Math.random() * 128;
  var rad = Math.random() * 2 + 0.5;
  var shade = Math.floor(Math.random() * 100) + 100;
  bctx.fillStyle = 'rgba(' + shade + ',' + shade + ',255,0.7)';
  bctx.beginPath();
  bctx.arc(bx, by, rad, 0, Math.PI * 2);
  bctx.fill();
}
var beltTexture = new THREE.CanvasTexture(beltCanvas);
beltTexture.wrapS = THREE.RepeatWrapping;
beltTexture.wrapT = THREE.RepeatWrapping;
beltTexture.repeat.set(4, 1);

var beltGeo = new THREE.PlaneGeometry(50, 8);
var beltMat = new THREE.MeshBasicMaterial({
  map: beltTexture,
  transparent: true,
  opacity: 0.5,
  side: THREE.DoubleSide
});
var belt = new THREE.Mesh(beltGeo, beltMat);
belt.rotation.z = Math.PI / 6;
belt.position.set(0, -2, -15);
scene.add(belt);


var earthCanvas = document.createElement('canvas');
earthCanvas.width = 256;
earthCanvas.height = 256;
var ectx = earthCanvas.getContext('2d');

function drawEarth(mood) {
  ectx.fillStyle = '#3a7bd5';
  ectx.fillRect(0, 0, 256, 256);

  
  ectx.fillStyle = '#4caf50';
  var blobs = 5 + Math.min(mood, 10);
  for (var i = 0; i < blobs; i++) {
    var cx = Math.random() * 256;
    var cy = Math.random() * 256;
    ectx.beginPath();
    ectx.moveTo(cx, cy);
    for (var a = 0; a < 8; a++) {
      var ang = (a / 8) * Math.PI * 2;
      var r = 10 + Math.random() * 15;
      ectx.lineTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
    }
    ectx.closePath();
    ectx.fill();
  }

  
  ectx.strokeStyle = 'rgba(255,255,255,0.6)';
  ectx.lineWidth = 3;
  for (var c = 0; c < 6; c++) {
    ectx.beginPath();
    ectx.arc(
      Math.random() * 256,
      Math.random() * 256,
      8 + Math.random() * 10,
      0,
      Math.PI * 1.4
    );
    ectx.stroke();
  }

  
  ectx.fillStyle = '#fff';
  ectx.font = '18px Comic Sans MS, sans-serif';
  ectx.save();
  ectx.translate(60, 230);
  ectx.rotate(-0.05);
  ectx.fillText('earth v1', 0, 0);
  ectx.restore();
}

drawEarth(0);
var earthTexture = new THREE.CanvasTexture(earthCanvas);


var earthGroup = new THREE.Group();
var earthGeo = new THREE.SphereGeometry(1.4, 24, 24);
var earthMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  map: earthTexture
});
var earthMesh = new THREE.Mesh(earthGeo, earthMat);
earthMesh.position.y = 1.6;
earthMesh.castShadow = true;
earthGroup.add(earthMesh)
scene.add(earthGroup);


var tinyMoonGeo = new THREE.SphereGeometry(0.3, 12, 12);
var tinyMoonMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
var tinyMoon = new THREE.Mesh(tinyMoonGeo, tinyMoonMat);
scene.add(tinyMoon);


var earthColors = [
  0xffffff,
  0xff9f43,
  0xff6b9d,
  0x4ecdc4,
  0xffe66d,
  0xb197fc
];


var planets = [];

function makePlanet(geo, color, x, z, name, hasRing) {
  var group = new THREE.Group();
  var mat = new THREE.MeshStandardMaterial({ color: color });
  var mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  group.add(mesh);

  if (hasRing) {
    var ringGeo = new THREE.TorusGeometry(0.9, 0.08, 8, 32);
    var ringMat = new THREE.MeshStandardMaterial({ color: 0xd9c07f });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.2;
    group.add(ring);
  }

  group.position.set(x, 2.2, z);
  group.userData.name = name;
  group.userData.baseY = 2.2;
  group.userData.floatOffset = Math.random() * 10;
  group.userData.clickMesh = mesh;
  scene.add(group);
  planets.push(group);
}

makePlanet(
  new THREE.SphereGeometry(0.5, 16, 16),
  0xd85a30,
  3.5,
  1.5,
  'mars'
);

makePlanet(
  new THREE.SphereGeometry(0.55, 16, 16),
  0xf0d18a,
  -3.5,
  1.5,
  'saturn',
  true
);

makePlanet(
  new THREE.BoxGeometry(0.9, 0.7, 0.9),
  0x7f77dd,
  3.5,
  -2,
  'gas guy'
);

makePlanet(
  new THREE.ConeGeometry(0.5, 0.9, 8),
  0x999999,
  -3.5,
  -2,
  'moon rock'
);


var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var hovered = null;

function updateMouse(evt) {
  mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(evt.clientY / window.innerHeight) * 2 + 1;
}

function getClickTargets() {
  var arr = [];
  for (var i = 0; i < planets.length; i++) {
    arr.push(planets[i].userData.clickMesh);
  }
  return arr;
}

function findGroupFromMesh(mesh) {
  for (var i = 0; i < planets.length; i++) {
    if (planets[i].userData.clickMesh === mesh) return planets[i];
  }
  return null;
}

window.addEventListener('mousemove', function(evt) {
  updateMouse(evt);
  raycaster.setFromCamera(mouse, camera);
  var hits = raycaster.intersectObjects(getClickTargets());

  if (hovered && (hits.length === 0 || hits[0].object !== hovered)) {
    hovered.scale.set(1, 1, 1);
    hovered = null;
  }

  if (hits.length > 0) {
    hovered = hits[0].object;
    hovered.scale.set(1.2, 1.2, 1.2);
  }
});

var count = 0;
var msgbox = document.getElementById('msgbox');
var countSpan = document.getElementById('count');


var messages = [
  'nom nom!!',
  'more planets please',
  'that was crunchy',
  'im getting bigger',
  'hehe thanks',
  'again again',
  'space burp.',
  'ok that one was weird tasting'
];

function feedEarth(planetName) {
  count = count + 1;
  countSpan.textContent = count;

  var newColor =
    earthColors[Math.floor(Math.random() * earthColors.length)];

  earthMesh.material.color.setHex(newColor);

  earthMesh.userData.pulse = 1;

  drawEarth(count);
  earthTexture.needsUpdate = true;

  var msg = messages[Math.floor(Math.random() * messages.length)];
  msgbox.style.display = 'block';
  msgbox.textContent =
    'earth says: ' + msg + ' (ate ' + planetName + ')';

  clearTimeout(window.msgTimer);

  window.msgTimer = setTimeout(function() {
    msgbox.style.display = 'none';
  }, 1800);
}


window.addEventListener('click', function(evt) {
  updateMouse(evt);
  raycaster.setFromCamera(mouse, camera);

  var hits = raycaster.intersectObjects(getClickTargets());

  if (hits.length > 0) {
    var group = findGroupFromMesh(hits[0].object);

    if (group && !group.userData.eaten) {
      feedEarth(group.userData.name);
      group.userData.eaten = true;
      group.userData.eatTime = 0;
    }
  }
});

document.getElementById('feedBtn').addEventListener('click', function() {
  var notEaten = planets.filter(function(p) {
    return !p.userData.eaten;
  });

  if (notEaten.length === 0) {
    return; 
  }

  var p = notEaten[Math.floor(Math.random() * notEaten.length)];

  feedEarth(p.userData.name);
  p.userData.eaten = true;
  p.userData.eatTime = 0;
});

var spinSpeed = 0.5;
var fast = false;

document.getElementById('speedBtn').addEventListener('click', function() {
  fast = !fast;
  spinSpeed = fast ? 2.5 : 0.5;
});

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

var clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  var delta = clock.getDelta();
  var t = clock.getElapsedTime();

  earthGroup.position.y = Math.sin(t * 1.2) * 0.15;
  earthGroup.rotation.y += delta * spinSpeed;

  tinyMoon.position.x =
    earthGroup.position.x + Math.cos(t * 1.5) * 2.4;

  tinyMoon.position.z =
    Math.sin(t * 1.5) * 2.4;

  tinyMoon.position.y =
    1.6 + Math.sin(t * 2) * 0.2;

  stars.rotation.y += delta * 0.02;
  belt.rotation.z += delta * 0.01;

  if (earthMesh.userData.pulse) {
    earthMesh.userData.pulse -= delta * 2;

    var s =
      1 + Math.max(earthMesh.userData.pulse, 0) * 0.3;

    earthMesh.scale.set(s, s, s);
  }

  for (var i = 0; i < planets.length; i++) {
    var p = planets[i];

    if (!p.userData.eaten) {
      p.position.y =
        p.userData.baseY +
        Math.sin(t + p.userData.floatOffset) * 0.3;

      p.rotation.y += delta * 0.6;
    } else {
      p.userData.eatTime += delta;

      var e = p.userData.eatTime;

      p.position.y += delta * 2;

      p.position.x +=
        (earthGroup.position.x - p.position.x) *
        delta * 1.5;

      p.position.z +=
        (earthGroup.position.z - p.position.z) *
        delta * 1.5;

      p.scale.multiplyScalar(0.96);

      if (e > 1.2) {
        p.userData.eaten = false;
        p.scale.set(1, 1, 1);
        p.position.y = p.userData.baseY;
      }
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
