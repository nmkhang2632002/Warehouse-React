import * as d3 from "d3";
import { useMemo } from "react";
import * as THREE from "three";
async function readFile(path: string) {
  const data = await d3.csv(path, fnParse);
  return data;
}

function fnParse(row: Record<string, any>): Record<string, any> {
  const parsedRow: Record<string, any> = {};
  for (const key in row) {
    if (key.substring(0, 2) === "\\s") {
      parsedRow[key.substring(2)] = row[key];
    } else {
      const temp: Record<string, any> = {};
      temp[key] = row[key];
      d3.autoType(temp);
      parsedRow[key] = temp[key];
    }
  }

  return parsedRow;
}
async function getWarehouseData() {
  const data = await readFile("src/data/layout.csv");
  return data;
}
export { getWarehouseData };

function fnGetBackGroundColorInvert(backGroundColor: string) {
  var backgroundColorInvert = new THREE.Color(backGroundColor);
  backgroundColorInvert.setRGB(
    1.0 - backgroundColorInvert.r,
    1.0 - backgroundColorInvert.g,
    1.0 - backgroundColorInvert.b
  ); //https://stackoverflow.com/questions/6961725/algorithm-for-calculating-inverse-color
  return backgroundColorInvert;
} //fnGetBackGroundColorInvert

interface LayoutData {
  [key: string]: any;
}

export function fnBuildWarehouse(
  layoutData: LayoutData[],
  initialBackgroundColor = "#d9dccb"
): THREE.Group {
  const warehouse = new THREE.Group();
  warehouse.name = "warehouseGroup";

  const geometriesMap = new Map<
    string,
    { cubeGeometry: THREE.BoxGeometry; edgeGeometry: THREE.EdgesGeometry }
  >();

  const edgeMaterial = new THREE.LineBasicMaterial({
    color: fnGetBackGroundColorInvert(initialBackgroundColor),
    transparent: true,
    opacity: 0.2,
  });

  for (const data of layoutData) {
    const width = data["WIDTH"] ?? data["width"];
    const height = data["HEIGHT"] ?? data["height"];
    const depth = data["DEPTH"] ?? data["depth"];
    const geometryKey = `${width}:${height}:${depth}`;

    let cubeGeometry: THREE.BoxGeometry;
    let edgeGeometry: THREE.EdgesGeometry;

    if (geometriesMap.has(geometryKey)) {
      const geometries = geometriesMap.get(geometryKey)!;
      cubeGeometry = geometries.cubeGeometry;
      edgeGeometry = geometries.edgeGeometry;
    } else {
      cubeGeometry = new THREE.BoxGeometry(width, height, depth);
      edgeGeometry = new THREE.EdgesGeometry(cubeGeometry);
      geometriesMap.set(geometryKey, { cubeGeometry, edgeGeometry });
    }

    const cubeMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      wireframe: false,
    });

    const edge = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    edge.renderOrder = 0;
    edge.userData.type = "edge";

    const pallet = new THREE.Mesh(cubeGeometry, cubeMaterial);
    pallet.material.opacity = 0.2;
    pallet.userData.type = "pallet";
    pallet.renderOrder = 1;

    const slot = new THREE.Group();
    slot.add(edge);
    slot.add(pallet);

    slot.name = data[Object.keys(data)[0]];
    slot.position.x = (data["X"] ?? data["x"]) + height / 2;
    slot.position.y = (data["Z"] ?? data["z"]) + depth / 2;
    slot.position.z = (data["Y"] ?? data["y"]) + height / 2;
    slot.userData = {
      aisle: data["AISLE"] ?? data["aisle"],
      aisleSide: data["AISLESIDE"] ?? data["aisleside"],
      centerAxis: data["CENTERAXIS"] ?? data["centeraxis"],
      bay: data["BAY"] ?? data["bay"],
      type: "slot",
      numPallets: 1,
      selected: false,
    };

    warehouse.add(slot);
    data.visualObj = slot;
  }

  return warehouse;
}
