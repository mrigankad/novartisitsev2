const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/E36250409/Desktop/Novartis/novartisitsev2/src/components/dashboard/charts';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f !== 'ChartLegend.tsx');

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  const org = content;

  // 1. Update mapping
  const mapRegex = /\.map\((t|ticket)\s*=>\s*\(\{\s*([\s\S]*?)\}\)\)/;
  const match = content.match(mapRegex);
  
  if (match) {
      const paramName = match[1];
      let innerProps = match[2];
      
      const fieldsToAdd = [
          { key: 'createdBy', val: `${paramName}.createdBy || "-"` },
          { key: 'closedBy', val: `${paramName}.closedBy || "-"` },
          { key: 'assignee', val: `${paramName}.assignee || "-"` }
      ];

      fieldsToAdd.forEach(field => {
          if (!innerProps.match(new RegExp('\\b' + field.key + ':'))) {
              innerProps = innerProps.trim();
              if (innerProps && !innerProps.endsWith(',')) innerProps += ',';
              innerProps += `\n        ${field.key}: ${field.val}`;
          }
      });
      
      innerProps = innerProps.replace(/,\s*,/g, ',');
      content = content.replace(mapRegex, `.map(${paramName} => ({${innerProps}\n      }))`);
  }

  // 2. Update columns
  const colsRegex = /columns=\{\[\s*([\s\S]*?)\s*\]\}/;
  const colMatch = content.match(colsRegex);
  if (colMatch) {
      let innerCols = colMatch[1];
      const colsToAdd = [
          { key: 'assignee', label: 'Assigned To' },
          { key: 'createdBy', label: 'Created By' },
          { key: 'closedBy', label: 'Closed By' }
      ];

      colsToAdd.forEach(col => {
          if (!innerCols.match(new RegExp('key:\\s*["\']' + col.key + '["\']'))) {
              innerCols = innerCols.trim();
              if (innerCols && !innerCols.endsWith(',')) innerCols += ',';
              innerCols += `\n          { key: "${col.key}", label: "${col.label}" }`;
          }
      });

      content = content.replace(colsRegex, `columns={[\n          ${innerCols}\n        ]}`);
  }

  if (content !== org) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('Processed', file);
  }
}
