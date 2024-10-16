import * as d3 from "d3";
import * as THREE from "three";
import { colorMap } from "../data/color";
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

  const areaMap = new Map<string, THREE.Group>();
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
      opacity: 0.7,
      transparent: true,
      wireframe: false,
    });

    const edge = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    edge.renderOrder = 0;
    edge.userData.type = "edge";

    const pallet = new THREE.Mesh(cubeGeometry, cubeMaterial);
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
      area: data["AREA"] ?? data["area"],
    };
    if (!areaMap.has(data["AREA"] ?? data["area"])) {
      areaMap.set(data["AREA"] ?? data["area"], new THREE.Group());
    }
    areaMap.get(data["AREA"] ?? data["area"])!.add(slot);
  }

  for (let [area, value] of areaMap) {
    const textSprite = createTextSprite(area, colorMap[area]);
    const boundingBox = new THREE.Box3().setFromObject(value);
    const size = boundingBox.getSize(new THREE.Vector3());
    const center = boundingBox.getCenter(new THREE.Vector3());
    // Position text above the area
    textSprite.position.set(center.x, boundingBox.max.y + 40, center.z);
    value.add(textSprite);
    // Add plan to area
    const planGeometry = new THREE.PlaneGeometry(size.x, size.z);
    const planMaterial = new THREE.MeshBasicMaterial({
      color: colorMap[area],
      side: THREE.DoubleSide,
    });
    const plan = new THREE.Mesh(planGeometry, planMaterial);
    plan.position.set(center.x, boundingBox.min.y - 0.1, center.z);
    plan.rotateX(Math.PI / 2);
    value.add(plan);
    warehouse.add(value);
  }

  return warehouse;
}

function createTextSprite(text: string, color: string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (context) {
    const fontSize = 400;
    context.font = `${fontSize}px Arial`;
    const textWidth = context.measureText(text).width;
    canvas.width = textWidth + 20;
    canvas.height = fontSize + 20;

    // Set background color to transparent
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Set text properties
    context.fillStyle = color; // Text color
    context.font = `${fontSize}px Arial`; // Font size and family
    context.textAlign = "center";
    context.textBaseline = "middle";

    // Draw text
    context.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(canvas.width / 10, canvas.height / 10, 1); // Adjust scale as needed

  return sprite;
}
