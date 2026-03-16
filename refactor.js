const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/E36250409/Desktop/Novartis/novartisitsev2/src/components/dashboard/charts';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f !== 'ChartLegend.tsx');

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. Add resolvedAt and resolved to drillDownData map
  // Find mapping like:
  // .map(t => ({
  //   ticketId: t.ticketId,
  //   ...
  //   created: t.created,
  //   <we will insert here>
  const mapRegex = /\.map\((t|ticket)\s*=>\s*\(\{\s*([\s\S]*?)\}\)\)/g;
  content = content.replace(mapRegex, (match, paramName, innerProps) => {
    // Check if it already has resolvedAt
    if (innerProps.includes('resolvedAt:')) return match;
    
    // We add resolvedAt and resolved. If 'resolved' is already present (e.g., TotalTicketsDonutChart), we need to handle it.
    let newProps = innerProps;
    if (innerProps.includes('resolved:')) {
        // TotalTicketsDonutChart has `resolved: t.resolved || "-",`
        // replace it with resolvedAt and resolved
        newProps = newProps.replace(/resolved:\s*[^,]+,/, `resolvedAt: ${paramName}.resolvedAt || "-",\n        resolved: ${paramName}.resolved || "-",`);
    } else {
        // append them
        // find a good place to append. Let's just append at the end of the innerProps
        newProps = newProps.replace(/,\s*$/, '') + `,\n        resolvedAt: ${paramName}.resolvedAt || "-",\n        resolved: ${paramName}.resolved || "-"\n      `;
    }
    
    return `.map(${paramName} => ({${newProps}}))`;
  });

  // 2. Add extra columns to DrillDownModal
  // find:
  // columns={[
  //   ...
  //   { key: "created", label: "Created" },
  //   <we will insert here>
  // ]}
  const columnsRegex = /columns=\{\[\s*([\s\S]*?)\s*\]\}/g;
  content = content.replace(columnsRegex, (match, innerCols) => {
      if (innerCols.includes('"resolvedAt"')) return match;
      
      let newCols = innerCols;
      if (innerCols.includes('"resolved"')) {
          // TotalTicketsDonutChart has `{ key: "resolved", label: "Resolved" },`
          newCols = newCols.replace(/\{\s*key:\s*"resolved"[^\}]+\},/, `{ key: "resolvedAt", label: "Resolved At" },\n          { key: "resolved", label: "Time Taken" },`);
      } else {
          newCols = newCols.replace(/,\s*$/, '') + `,\n          { key: "resolvedAt", label: "Resolved At" },\n          { key: "resolved", label: "Time Taken" }\n        `;
      }
      return `columns={[\n          ${newCols}\n        ]}`;
  });

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Processed', file);
}
