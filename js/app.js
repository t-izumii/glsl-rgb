// import * as THREE from 'three';
import * as THREE from '../node_modules/three/build/three.module.js';
import vertexShader from './shaders/vertexShader.glsl';
import fragmentShader from './shaders/fragmentShader.glsl';

let scrollable = document.querySelector('.scrollable');

let current = 0;
let target = 0;
let ease = 0.075;


function lerp (start, end, t) {
  return start * (1 - t) + end * t;
}


function init () {

    document.body.style.height = `${scrollable.getBoundingClientRect().height}px`;
}

function smoothScroll() {
    target = window.scrollY;
    current = lerp(current, target, ease);
    scrollable.style.transform = `translate3d(0, ${-current}px,0)`
}

class EffectCanvas {
    constructor() {
        this.container = document.querySelector('main');
        this.images = [...document.querySelectorAll('img')];
        this.meshItem = [];
        this.setupCamera();
        this.createMeshItem();
        this.render();
    }

    get viewport(){
        let width = window.innerWidth;
        let height = window.innerHeight;
        let aspectRatio = width / height;
        return {
          width,
          height,
          aspectRatio
        };
    }

    setupCamera() {
        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        this.scene = new THREE.Scene();
        let parspective = 1000;
        const fov = (180 * (2 * Math.atan(window.innerHeight / 2 / parspective))) / Math.PI;

        this.camera = new THREE.PerspectiveCamera(fov, this.viewport.aspectRatio, 1, 1000);
        this.camera.position.z = parspective;

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.viewport.width, this.viewport.height);
        this.container.appendChild(this.renderer.domElement);
    }

    onWindowResize() {
        init();
        this.camera.aspect = this.viewport.aspectRatio;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.viewport.width, this.viewport.height);
    }

    createMeshItem() {
        this.images.forEach((img) => {
            let meshItem = new MeshItem(img, this.scene);
            this.meshItem.push(meshItem);
        });
    }

    render() {
        smoothScroll();
        for( let i = 0; i < this.meshItem.length; i++) {
            this.meshItem[i].render();
        }
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }
}



class MeshItem {
    constructor(element , scene) {
        this.element = element;
        this.scene = scene;
        this.offset = new THREE.Vector2(0 , 0);
        this.sizes = new THREE.Vector2(0 , 0);
        this.createMesh();
    }

    getDimensions() {
        const {width , height, top , left } = this.element.getBoundingClientRect();
        this.sizes.set(width, height);
        this.offset.set (left - window.innerWidth / 2 + width / 2 , -top + window.innerHeight / 2 - height / 2);
    }

    createMesh() {
        this.geometry = new THREE.PlaneGeometry(1,1,100,100);
        this.imageTexture = new THREE.TextureLoader().load(this.element.src);
        this.uniforms = {
            uTexture : {value: this.imageTexture},
            uOffset : {value: new THREE.Vector2(0.0 , 0.0)},
            uAlpha : { value: 1.0},
        }
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });

        this.mesh = new THREE.Mesh(this.geometry , this.material);
        this.getDimensions();
        this.mesh.position.set(this.offset.x, this.offset.y, 0);
		this.mesh.scale.set(this.sizes.x, this.sizes.y, 1);

        this.scene.add(this.mesh);
    }

    render() {
        this.getDimensions();
        this.mesh.position.set(this.offset.x , this.offset.y , 0);
        this.mesh.scale.set(this.sizes.x , this.sizes.y);
        this.uniforms.uOffset.value.set(this.offset.x * 0.0, -(target- current) * 0.0003 )
    }

}

// class MeshItem{
//     // Pass in the scene as we will be adding meshes to this scene.
//     constructor(element, scene){
//         this.element = element;
//         this.scene = scene;
//         this.offset = new THREE.Vector2(0,0); // Positions of mesh on screen. Will be updated below.
//         this.sizes = new THREE.Vector2(0,0); //Size of mesh on screen. Will be updated below.
//         this.createMesh();
//     }

//     getDimensions(){
//         const {width, height, top, left} = this.element.getBoundingClientRect();
//         this.sizes.set(width, height);
//         this.offset.set(left - window.innerWidth / 2 + width / 2, -top + window.innerHeight / 2 - height / 2); 
//     }

//     createMesh(){
//         this.geometry = new THREE.PlaneGeometry(1,1,100,100);
//         this.imageTexture = new THREE.TextureLoader().load(this.element.src);
//         this.uniforms = {
//             uTexture: {
//                 //texture data
//                 value: this.imageTexture
//               },
//               uOffset: {
//                 //distortion strength
//                 value: new THREE.Vector2(0.0, 0.0)
//               },
//               uAlpha: {
//                 //opacity
//                 value: 1.
//               }
//         };
//         this.material = new THREE.ShaderMaterial({
//             uniforms: this.uniforms,
//             vertexShader: vertexShader,
//             fragmentShader: fragmentShader,
//             transparent: true,
//             // wireframe: true,
//             side: THREE.DoubleSide
//         })
//         this.mesh = new THREE.Mesh( this.geometry, this.material );
//         this.getDimensions(); // set offsetand sizes for placement on the scene
//         this.mesh.position.set(this.offset.x, this.offset.y, 0);
// 		this.mesh.scale.set(this.sizes.x, this.sizes.y, 1);

//         this.scene.add( this.mesh );
//     }

//     render(){
//         // this function is repeatidly called for each instance in the aboce 
//         this.getDimensions();
//         this.mesh.position.set(this.offset.x, this.offset.y, 0)
// 		this.mesh.scale.set(this.sizes.x, this.sizes.y, 1)
//         this.uniforms.uOffset.value.set(this.offset.x * 0.0, -(target- current) * 0.0003 )
//     }
// }




init();
new EffectCanvas();