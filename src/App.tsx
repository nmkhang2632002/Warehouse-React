import { useEffect, useRef } from "react";
import Warehouse from "./components/Warehouse";
import { fnBuildWarehouse, getWarehouseData } from "./utils/warehouse-until";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

const App = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    getWarehouseData().then((data) => {
      const warehouseScene = fnBuildWarehouse(data);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      const renderer = new THREE.WebGLRenderer();
      const orbit = new OrbitControls(camera);

      const light = new THREE.AmbientLight(0x404040); // soft white light
      scene.add(light);

      ref.current?.appendChild(renderer.domElement);
      scene.add(warehouseScene);
      camera.position.z = 5;
      const animate = () => {
        requestAnimationFrame(animate);
        orbit.update();
        renderer.render(scene, camera);
      };
      animate();
    });
  }, []);
  return <div ref={ref}>{/* <Warehouse /> */}</div>;
};

export default App;
