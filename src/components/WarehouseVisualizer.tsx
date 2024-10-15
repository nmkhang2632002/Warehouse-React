import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { fnBuildWarehouse, getWarehouseData } from "../utils/warehouse-until";

const WarehouseVisualizer = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls;

    const init = async () => {
      const data = await getWarehouseData();
      const warehouseScene = fnBuildWarehouse(data);

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xe6e8e1); // Light beige background color

      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      ref.current?.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      warehouseScene.position.set(0, 0, 0);
      scene.add(warehouseScene);

      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

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

      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };

      animate();
      setLoading(false);

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        renderer.dispose();
      };
    };

    init();
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
    </div>
  );
};

export default WarehouseVisualizer;
