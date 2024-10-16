import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { fnBuildWarehouse, getWarehouseData } from "../utils/warehouse-until";
import warehouseData from "../data/data";

const WarehouseVisualizer = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const carRef = useRef<THREE.Object3D | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    let controls: OrbitControls;

    const init = async () => {
      const data = await getWarehouseData();
      const warehouseScene = fnBuildWarehouse(data);

      const scene = new THREE.Scene();
      sceneRef.current = scene;
      scene.background = new THREE.Color(0xe6e8e1); // Light beige background color
      const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      rendererRef.current = renderer;
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      ref.current?.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      //add warehouse to the scene
      warehouseScene.position.set(0, 0, 0);
      scene.add(warehouseScene);

      // Load the fol model
      const loader = new GLTFLoader();
      loader.load(
        "/assets/scene.gltf",
        function (gltf) {
          // Adjust the scale and position of the loaded object
          gltf.scene.scale.set(1, 1, 1); // Adjust scale as needed
          gltf.scene.position.set(800, 0, 1000); // Adjust position as needed
          scene.add(gltf.scene);
          carRef.current = gltf.scene;
        },
        undefined,
        function (error) {
          console.error(
            "An error happened while loading the GLTF file:",
            error
          );
        }
      );

      loader.load(
        "/assets/scene.gltf",
        function (gltf) {
          // Adjust the scale and position of the loaded object
          gltf.scene.scale.set(1, 1, 1); // Adjust scale as needed
          gltf.scene.position.set(100, 0, 1000); // Adjust position as needed
          scene.add(gltf.scene);
          carRef.current = gltf.scene;
        },
        undefined,
        function (error) {
          console.error(
            "An error happened while loading the GLTF file:",
            error
          );
        }
      );

      // Add directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      // Calculate bounding box of the warehouse
      const box = new THREE.Box3().setFromObject(warehouseScene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Add grid
      const gridSize = Math.max(size.x, size.z) * 1.5;
      const gridDivisions = 10;
      const gridHelper = new THREE.GridHelper(
        gridSize,
        gridDivisions,
        0x00ff00,
        0x00ff00
      );
      gridHelper.position.y = box.min.y - 0.01; // Place grid slightly below the warehouse
      gridHelper.position.x = center.x;
      gridHelper.position.z = center.z;
      gridHelper.material.opacity = 0.15;
      gridHelper.material.transparent = true;
      scene.add(gridHelper);

      // Position camera to see the entire warehouse
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 2; // Zoom out a bit more
      camera.position.set(
        center.x + cameraZ,
        center.y + cameraZ / 2,
        center.z + cameraZ
      );
      camera.lookAt(center);

      controls.target.copy(center);
      controls.maxDistance = cameraZ;

      // Add outer border
      const borderGeometry = new THREE.BoxGeometry(
        size.x * 1.05,
        size.y * 1.05,
        size.z * 1.05
      );
      const borderEdges = new THREE.EdgesGeometry(borderGeometry);
      const borderLine = new THREE.LineSegments(
        borderEdges,
        new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
      );
      borderLine.position.copy(center);
      scene.add(borderLine);

      setLoading(false);

      const handleResize = () => {
        if (camera && renderer) {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        renderer.dispose();
      };
    };

    init();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (controls) controls.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();
  }, []);

  useEffect(() => {
    // Add keyboard event listener for car movement
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!carRef.current) return;

      const moveDistance = 10; // Adjust this value to change movement speed
      switch (event.key) {
        case "ArrowUp":
          carRef.current.position.z += moveDistance;
          break;
        case "ArrowDown":
          carRef.current.position.z -= moveDistance;
          break;
        case "ArrowLeft":
          carRef.current.position.x -= moveDistance;
          break;
        case "ArrowRight":
          carRef.current.position.x += moveDistance;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={ref} style={{ width: "100vw", height: "100vh" }}>
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#333",
            fontSize: "24px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Loading Warehouse...
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "#333",
          fontSize: "16px",
          fontFamily: "Arial, sans-serif",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        Use arrow keys to move the car
      </div>
    </div>
  );
};

export default WarehouseVisualizer;
