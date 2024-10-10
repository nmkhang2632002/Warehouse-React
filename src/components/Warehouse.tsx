"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Box, Plane } from "@react-three/drei";
import { useState, useRef } from "react";
import * as THREE from "three";
import { ReactNode } from "react";
const Bin = ({
  position,
  size,
  color,
  name,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  name: string;
}) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.scale.setScalar(hovered ? 1.05 : 1);
    }
  });

  return (
    <group position={position}>
      <Box
        args={size}
        ref={ref}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial color={color} />
      </Box>
      <Text
        position={[0, size[1] / 2 + 0.05, size[2] / 2 + 0.05]}
        fontSize={0.1}
        color="black"
        anchorX="center"
        anchorY="bottom"
      >
        {name}
      </Text>
    </group>
  );
};

const Shelf = ({
  position,
  levels,
  binsPerLevel,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  levels: number;
  binsPerLevel: number;
  rotation?: [number, number, number];
}) => {
  const shelfWidth = binsPerLevel * 1.1;
  const shelfHeight = levels * 1.1;
  const shelfDepth = 1;
  const binSize: [number, number, number] = [1, 0.8, 0.8];
  const levelHeight = 1.1;

  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: levels }, (_, level) =>
        Array.from({ length: binsPerLevel }, (_, bin) => (
          <Bin
            key={`${level}-${bin}`}
            position={[
              bin * 1.1 - shelfWidth / 2 + 0.5,
              level * levelHeight + binSize[1] / 2 + 0.1,
              0,
            ]}
            size={binSize}
            color={`hsl(${Math.random() * 360}, 70%, 70%)`}
            name={`B${level + 1}-${bin + 1}`}
          />
        ))
      )}
      {[0, shelfWidth].map((x, i) => (
        <Box
          key={i}
          args={[0.1, shelfHeight, shelfDepth]}
          position={[x - shelfWidth / 2, shelfHeight / 2, 0]}
        >
          <meshStandardMaterial color="gray" />
        </Box>
      ))}
      {Array.from({ length: levels + 1 }, (_, i) => (
        <Box
          key={i}
          args={[shelfWidth, 0.1, shelfDepth]}
          position={[0, i * levelHeight, 0]}
        >
          <meshStandardMaterial color="gray" />
        </Box>
      ))}
    </group>
  );
};

interface StorageAreaProps {
  position: [number, number, number];
  size: [number, number];
  color: string;
  name: string;
  shelves: Array<{
    position: [number, number, number];
    levels: number;
    binsPerLevel: number;
    rotation?: [number, number, number];
  }>;
}

const StorageArea = ({
  position,
  size,
  color,
  name,
  shelves,
}: StorageAreaProps) => {
  return (
    <group position={position}>
      <Plane args={size} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color={color} />
      </Plane>

      <Text
        position={[0, 8, 0]}
        fontSize={1.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
      {shelves.map((shelf, index) => (
        <Shelf key={index} {...shelf} />
      ))}
    </group>
  );
};

const WarehouseContainer = ({ children }: { children: ReactNode }) => {
  return (
    <group>
      <Box args={[42, 0.2, 42]} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#cccccc" />
      </Box>
      {children}
    </group>
  );
};

const Warehouse = () => {
  const gridSize = 2;
  const areaSize: [number, number] = [18, 18];
  const spacing = 2;

  const areas = [
    {
      color: "#e6f3ff",
      name: "Storage A",
      shelves: [
        {
          position: [-4, 0, -4] as [number, number, number],
          levels: 4,
          binsPerLevel: 4,
        },
        {
          position: [4, 0, -4] as [number, number, number],
          levels: 4,
          binsPerLevel: 4,
        },
        {
          position: [-4, 0, 4] as [number, number, number],
          levels: 4,
          binsPerLevel: 4,
        },
        {
          position: [4, 0, 4] as [number, number, number],
          levels: 4,
          binsPerLevel: 4,
        },
      ],
    },
    {
      color: "#fff0e6",
      name: "Storage B",
      shelves: [
        {
          position: [0, 0, -6] as [number, number, number],
          levels: 5,
          binsPerLevel: 7,
          rotation: [0, Math.PI / 2, 0] as [number, number, number],
        },
        {
          position: [0, 0, 0] as [number, number, number],
          levels: 5,
          binsPerLevel: 7,
          rotation: [0, Math.PI / 2, 0] as [number, number, number],
        },
        {
          position: [0, 0, 6] as [number, number, number],
          levels: 5,
          binsPerLevel: 7,
          rotation: [0, Math.PI / 2, 0] as [number, number, number],
        },
      ],
    },
    {
      color: "#e6ffe6",
      name: "Storage C",
      shelves: [
        {
          position: [-6, 0, 0] as [number, number, number],
          levels: 3,
          binsPerLevel: 5,
        },
        {
          position: [0, 0, 0] as [number, number, number],
          levels: 3,
          binsPerLevel: 5,
        },
        {
          position: [6, 0, 0] as [number, number, number],
          levels: 3,
          binsPerLevel: 5,
        },
      ],
    },
    {
      color: "#ffe6e6",
      name: "Storage D",
      shelves: [
        {
          position: [-4, 0, -4] as [number, number, number],
          levels: 6,
          binsPerLevel: 3,
        },
        {
          position: [4, 0, -4] as [number, number, number],
          levels: 6,
          binsPerLevel: 3,
        },
        {
          position: [-4, 0, 4] as [number, number, number],
          levels: 6,
          binsPerLevel: 3,
        },
        {
          position: [4, 0, 4] as [number, number, number],
          levels: 6,
          binsPerLevel: 3,
        },
      ],
    },
  ];

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas shadows camera={{ position: [30, 30, 30], fov: 50 }}>
        <ambientLight />
        <WarehouseContainer>
          {Array.from({ length: gridSize * gridSize }, (_, index) => {
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;
            const x = (col - (gridSize - 1) / 2) * (areaSize[0] + spacing);
            const z = (row - (gridSize - 1) / 2) * (areaSize[1] + spacing);
            const area = areas[index];

            return area ? (
              <StorageArea
                key={index}
                position={[x, 0, z]}
                size={areaSize}
                {...area}
              />
            ) : null;
          })}
        </WarehouseContainer>
        <OrbitControls target={[0, 0, 0]} />
      </Canvas>
    </div>
  );
};

export default Warehouse;
