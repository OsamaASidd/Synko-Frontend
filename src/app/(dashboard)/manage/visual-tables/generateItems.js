export default function generateItems() {
  const items = [];
  let xVal = 5;
  for (let i = 0; i < 3; i++) {
    xVal = xVal + 120;
    items.push({
      id: "Table-" + i,
      x: xVal,
      y: 60,
    });
  }
  return items;
}
