const areas = ["A", "B", "C", "D"];
const warehouseData: any[] = [];

areas.forEach((area, areaIndex) => {
  for (let i = 0; i < 20; i++) {
    warehouseData.push({
      LOCATION: `${area}${i + 1}-100-R-${i * 50}-${areaIndex * 200}-0`,
      WIDTH: 48,
      DEPTH: 48,
      HEIGHT: 82,
      X: i * 50,
      Y: areaIndex * 200,
      Z: 0,
      AISLE: `${area}${i + 1}`,
      CENTERAXIS: "X",
      AISLESIDE: "R",
      BAY: 100 + i,
      WAREHOUSE: "WARREN",
      AREA: area,
      LEVEL: 1,
    });
  }
});
export default warehouseData;
