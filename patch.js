const fs = require('fs');

function patchFile() {
  let content = fs.readFileSync('index.html', 'utf8');

  // 1. SPENDING CHART HEIGHT & LOGIC
  // Replace bucket logic to include count
  const bucketLogicOld = `var existing = buckets.get(key) || {
      label: MONTH_SHORT[d.getMonth()] + ' ' + String(d.getFullYear()).slice(-2),
      value: 0
    };
    existing.value += Math.max(0, Number(item.price) || 0);
    buckets.set(key, existing);`;
  
  const bucketLogicNew = `var existing = buckets.get(key) || {
      label: MONTH_SHORT[d.getMonth()] + ' ' + String(d.getFullYear()).slice(-2),
      value: 0,
      count: 0
    };
    existing.value += Math.max(0, Number(item.price) || 0);
    existing.count++;
    buckets.set(key, existing);`;
  
  content = content.replace(bucketLogicOld, bucketLogicNew);

  // Replace chart dimension and layout logic
  const chartLayoutOld = `var max = Math.max.apply(null, data.map(function(x) { return x.value; }).concat([1]));
  var W = 620, H = 218;
  var left = 48, right = 12, top = 18, bottom = 32;
  var base = H - bottom;
  var plot = base - top;
  var slot = (W - left - right) / data.length;
  var barW = Math.max(14, Math.min(48, slot * 0.58));`;

  const chartLayoutNew = `var max = Math.max.apply(null, data.map(function(x) { return x.value; }).concat([1]));
  var W = 620, H = 180;
  var left = 48, right = 12, top = 18, bottom = 32;
  var base = H - bottom;
  var plot = base - top;
  var slotCount = Math.max(data.length, 3);
  var slot = (W - left - right) / slotCount;
  var barW = Math.max(14, Math.min(48, slot * 0.58));
  var totalOffset = data.length === 1 ? (W - left - right) / 2 - slot / 2 : 0;`;

  content = content.replace(chartLayoutOld, chartLayoutNew);

  // Replace chart bar tooltip logic
  const tooltipOld = `var x = left + slot * i + (slot - barW) / 2;
    var y = base - h;
    return '<rect class="chart-bar" x="' + x + '" y="' + y +
           '" width="' + barW + '" height="' + h + '" rx="5">' +
           '<title>' + item.label + ': ' + analyticsCurrency(item.value) + '</title></rect>' +`;

  const tooltipNew = `var x = left + totalOffset + slot * i + (slot - barW) / 2;
    var y = base - h;
    var tooltipText = item.label + ' \u2014 ' + item.count + ' campaign' + (item.count === 1 ? '' : 's') + ' \u2014 Total: ' + analyticsCurrency(item.value);
    return '<rect class="chart-bar" x="' + x + '" y="' + y +
           '" width="' + barW + '" height="' + h + '" rx="5">' +
           '<title>' + tooltipText + '</title></rect>' +`;

  content = content.replace(tooltipOld, tooltipNew);


  // 2. KPI SECONDARY METRICS CSS
  const kpiMetaOld = `/* ── KPI Meta ── */
.kpi-meta {
  margin-top: 7px;
  color: var(--ink3);
  font-size: 11.5px;
}
.kpi-meta strong {
  color: var(--ink2);
  font-weight: 600;
}`;
  
  const kpiMetaNew = `/* ── KPI Meta ── */
.kpi-meta {
  margin-top: 5px;
  color: var(--ink3);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.2px;
}
.kpi-meta strong {
  color: var(--ink2);
  font-weight: 600;
}`;
  
  content = content.replace(kpiMetaOld, kpiMetaNew);

  const kpiValueOld = `/* ── KPI Value ── */
.analytics-kpi .stat-value,
.kpi-value {
  font: 800 26px/1.1 var(--font-display);
  margin-top: 15px;
  letter-spacing: -0.8px;
}`;

  const kpiValueNew = `/* ── KPI Value ── */
.analytics-kpi .stat-value,
.kpi-value {
  font: 800 24px/1.1 var(--font-display);
  margin-top: 12px;
  letter-spacing: -0.5px;
}`;

  content = content.replace(kpiValueOld, kpiValueNew);


  // 3. TABLE DATE FORMAT
  const dateFmtOld = `var ds = it.year + '-' + pad(it.month) + '-' + pad(it.date);
    var ps = (it.payYear || it.year) + '-' + pad(it.payMonth || it.month) + '-' + pad(it.payDate || it.date);`;

  const dateFmtNew = `var mNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var ds = pad(it.date) + ' ' + mNames[(it.month||1)-1] + ' ' + it.year;
    var pm = it.payMonth || it.month;
    var ps = pad(it.payDate || it.date) + ' ' + mNames[(pm||1)-1] + ' ' + (it.payYear || it.year);`;

  content = content.replace(dateFmtOld, dateFmtNew);


  // 4. CHART CARD HEIGHT CSS
  content = content.replace(/min-height: 218px;/g, 'min-height: 180px;');
  content = content.replace(/height: 218px;/g, 'height: 180px;');


  // 5. TABLE COLUMN WIDTHS AND RESPONSIVE OVERFLOW
  const tableCssOld = `.table-wrap {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}`;

  const tableCssNew = `.table-wrap {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow-x: auto;
  overflow-y: hidden;
}
/* ── Table Columns Polish ── */
#table-list th, #table-list td { white-space: nowrap; }
#table-list th:nth-child(3), #table-list td:nth-child(3) { width: 22%; min-width: 140px; white-space: normal; }
#table-list th:nth-child(4), #table-list td:nth-child(4) { width: 20%; min-width: 120px; white-space: normal; }`;

  content = content.replace(tableCssOld, tableCssNew);

  fs.writeFileSync('index.html', content, 'utf8');
  console.log("Patched successfully!");
}

patchFile();
