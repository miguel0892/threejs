import * as THREE from 'three';
import { OrbitControls} from 'three/examples/jsm/Addons.js';
import * as dat from 'dat.gui';

import nebula from '../img/nebula.jpg';
import stars from '../img/stars.jpg';
// import skystars from '../img/sky-stars.webp';
// import { textureLoad } from 'three/examples/jsm/nodes/Nodes.js';

const renderer = new THREE.WebGLRenderer();

renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight)

document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera,renderer.domElement);

const axesHelper = new THREE.AxesHelper(3)
scene.add(axesHelper)

camera.position.set(-10,30,30);
orbit.update();


const boxGeometry = new THREE.BoxGeometry; //skeleton
const boxMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00}); //material
const box = new THREE.Mesh(boxGeometry, boxMaterial); //combination of the skeleton and the material in a mesh
scene.add(box); //add the mesh to the scene

//plane
const planeGeometry = new THREE.PlaneGeometry(50,50); //skeleton
const planeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    side: THREE.DoubleSide //para que ambos lados del plano puedan ser visibles y no solo el frontal
});
const plane = new THREE.Mesh(planeGeometry,planeMaterial)
scene.add(plane)
plane.rotation.x=-0.5*Math.PI;
plane.receiveShadow = true; //para que el plano reciba sombras


//grid
const gridHelper = new THREE.GridHelper(50);
scene.add(gridHelper)
//sphere
const sphereGeometry = new THREE.SphereGeometry(4,50,50); // los dos datos luego del radio es para cambiar el numero de segmentos que se muestran
const sphereMaterial = new THREE.MeshStandardMaterial({ //si usamos los demás materiales después del basic, se verán las figuras en negro por que no hay fuente de luz

    color:0xFFF000,
    wireframe:false, //para que la esfera sea completamente redonda,esférica, podemos ver de esta forma el esqueleto de la esfera
})
const sphere = new THREE.Mesh(sphereGeometry,sphereMaterial);

scene.add(sphere);
sphere.position.set(-10,10,0) //x,y,z
sphere.castShadow = true;

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0x333333,80);
// scene.add(directionalLight)
// directionalLight.position.set(-30,50,10)
// directionalLight.castShadow = true;
// directionalLight.shadow.camera.bottom = -12;
// directionalLight.shadow.camera.left = -12;
// const dLightHelper = new THREE.DirectionalLightHelper(directionalLight,5);
// scene.add(dLightHelper)

// const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(dLightShadowHelper)

const spotLight = new THREE.SpotLight(0xFFFFFF,100000);
scene.add(spotLight);
spotLight.position.set(-100,100,0)
spotLight.castShadow = true;
spotLight.angle=0.2;

const sLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(sLightHelper);



// scene.fog = new THREE.Fog(0xFFFFFF, 0, 200);

scene.fog = new THREE.FogExp2(0xFFFFFF, 0.01);
// renderer.setClearColor(0xFFEA00);

const textureLoader = new THREE.TextureLoader();
// scene.background = textureLoader.load(stars);
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    nebula,
    nebula,
    stars,
    stars,
    stars,
    stars,
]);


const box2Geometry = new THREE.BoxGeometry(4, 4, 4);
const box2Material = new THREE.MeshStandardMaterial({
    // color: 0x00ff00,
    // map: textureLoader.load(nebula)
});

const box2MultiMaterial = [
    new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
];

const box2 = new THREE.Mesh(box2Geometry, box2MultiMaterial);
scene.add(box2);
box2.position.set(0, 15, 10);
box2.material.map = textureLoader.load(nebula);
const gui = new dat.GUI();
const options = {
    sphereColor: '#fff000',
    wireframe:false,
    speed:0.01,
    angle:0.2,
    focus:0,
    intensity:15000,
    penumbra: 0.5
}

gui.addColor(options,'sphereColor').onChange(function(e){//Con este metodo puedo cambiar el color de la esfera a cualquiera que escoja desde el menu
    sphere.material.color.set(e)
})
gui.add(options, 'wireframe').onChange(function(e){
    sphere.material.wireframe = e;
})

gui.add(options,'speed',0,0.1)
let step = 0;

const mousePosition = new THREE.Vector2();

window.addEventListener('mouseover', function(e){
    mousePosition.x = (e.clientX /  window.innerWidth) * 2 - 1;
    mousePosition.y =  - (e.clientY /  window.innerHeight) * 2 + 1;
});



gui.add(options,'angle',0,1);
gui.add(options, "intensity",0, 30000);
gui.add(options, "focus", 0,15000);
gui.add(options, "penumbra", 0, 1);


const rayCaster = new THREE.Raycaster();
const sphereId = sphere.id; 
box2.name = 'theBox';
box2.castShadow = true;


function animate(time){
    
    box.rotation.x = time/1000;
    box.rotation.y = time/1000;
    sphere.position.y =15*Math.abs(Math.sin(step))

    step += options.speed;
    spotLight.angle = options.angle;
    spotLight.intensity = options.intensity
    spotLight.penumbra = options.penumbra;
    sLightHelper.update();

    
    rayCaster.setFromCamera(mousePosition, camera);
    const intersects = rayCaster.intersectObjects(scene.children);

    for(let i = 0; i < intersects.length; i++){
        if(intersects[i].object.id === sphereId){
            console.log(intersects[i].object.id)
            
            intersects[i].object.material.color.set(0xFF0000)
        }

        if(intersects[i].object.name === 'theBox'){
            console.log(intersects[i].object.id)
            intersects[i].object.rotation.x = time/1000;
            intersects[i].object.rotation.y = time/1000;
        }
    }

    renderer.render(scene,camera);
}
renderer.setAnimationLoop(animate);