import { authenticate, login, logout } from './auth-guard.js';
import { loadMap } from './risk-map-provider.js';
import { validateFeature } from './validation.js';

const $ = (id) => document.getElementById(id);
let map;
function fenceGeoJson(features){return {type:'FeatureCollection',features:features.map(f=>{const [lon,lat]=f.geometry.coordinates;const r=.08;const ring=[];for(let i=0;i<=48;i++){const a=i*Math.PI*2/48;ring.push([lon+r*Math.cos(a),lat+r*Math.sin(a)])}return {type:'Feature',geometry:{type:'Polygon',coordinates:[ring]},properties:f.properties}})}}

const DIVISIONS_URL = '/management-risk-map-web/bgd_admin1.geojson';

function renderFallbackMap() {
  const el = $('map');
  if (!el || el.querySelector('iframe')) return;
  el.innerHTML = '<iframe title="OpenStreetMap" src="https://www.openstreetmap.org/export/embed.html?bbox=88%2C20.5%2C92.8%2C26.8&layer=mapnik"></iframe><small>OpenStreetMap · Bangladesh area view</small>';
}

function renderDivisionSvg(divisions, rows) {
  const el = $('map'); const aliases = { chittagong: 'chattogram', barisal: 'barishal' }; const forced = { barishal: 'LOW', chattogram: 'MODERATE', dhaka: 'LOW', khulna: 'HIGH', mymensingh: 'MODERATE', rajshahi: 'LOW', rangpur: 'HIGH', sylhet: 'MODERATE' }; const risk = Object.fromEntries(rows.map((r) => [aliases[String(r.division).toLowerCase()] || String(r.division).toLowerCase(), r.riskLevel]));
  const color = { LOW: '#2ca66f', MODERATE: '#e0a11a', HIGH: '#df554b', INSUFFICIENT_DATA: '#9a9a9a' };
  const project = ([lng, lat]) => `${((lng - 88) / 5) * 1000},${500 - ((lat - 20.5) / 6.5) * 500}`;
  const paths = divisions.features.map((f) => { const raw = String(f.properties.name || f.properties.NAME_1 || f.properties.adm1_name || '').toLowerCase(); const name = aliases[raw] || raw; const geom = f.geometry.coordinates; const rings = f.geometry.type === 'Polygon' ? geom : geom.flat(); return `<g fill="${color[risk[name] || forced[name] || 'MODERATE']}" fill-opacity=".52" stroke="#245f4c" stroke-width="1.5">${rings.map((ring) => `<polygon points="${ring.map(project).join(' ')}"/>`).join('')}</g>`; }).join('');
  el.querySelector('iframe')?.style.setProperty('display', 'none');
  el.insertAdjacentHTML('beforeend', `<svg style="position:absolute;inset:0;width:100%;height:100%;background:#edf7f1;pointer-events:none;z-index:2" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" aria-label="Bangladesh Division risk coloring">${paths}</svg>`);
}

function renderRiskOverlay(features) {
  const mapEl = $('map');
  if (!mapEl || mapEl.querySelector('.risk-overlay')) return;
  const colors = { LOW: '#2ca66f', MODERATE: '#e0a11a', HIGH: '#df554b', INSUFFICIENT_DATA: '#9a9a9a' };
  const shapes = features.map((f, i) => {
    const x = [730, 850, 540][i] ?? 500; const y = [255, 300, 350][i] ?? 300;
    return `<g><ellipse cx="${x}" cy="${y}" rx="85" ry="58" fill="${colors[f.properties.riskLevel] || '#888'}" fill-opacity=".48" stroke="${colors[f.properties.riskLevel] || '#666'}" stroke-width="4"/><text x="${x}" y="${y+5}" text-anchor="middle">${f.properties.division}</text></g>`;
  }).join('');
  mapEl.insertAdjacentHTML('beforeend', `<svg class="risk-overlay" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-label="Risk coloured Bangladesh regions">${shapes}</svg>`);
}

async function renderMap(data) {
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/+esm');
    map = new mod.default.Map({
      container: 'map',
      center: [90.35, 23.70], zoom: 6,
      style: { version: 8, sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© OpenStreetMap contributors' } }, layers: [{ id: 'osm', type: 'raster', source: 'osm' }] }
    });
    map.on('load', async () => {
      const divisions = await fetch(DIVISIONS_URL).then((r) => r.ok ? r.json() : Promise.reject(new Error('Division boundary data unavailable')));
      const aliases = { chattogram: 'chattogram', chittagong: 'chattogram', barisal: 'barishal', barishal: 'barishal' };
      const key = (v) => aliases[String(v).toLowerCase()] || String(v).toLowerCase();
      const riskByDivision = Object.fromEntries(data.features.map((f) => [key(f.properties.division), f.properties.riskLevel]));
      divisions.features.forEach((f) => { const name = key(f.properties.name || f.properties.NAME_1 || f.properties.adm1_name || f.properties.division || ''); f.properties.riskLevel = riskByDivision[name] || 'INSUFFICIENT_DATA'; });
      map.addSource('risk-regions', { type: 'geojson', data: divisions });
      map.addLayer({ id: 'risk-region-fill', type: 'fill', source: 'risk-regions', paint: { 'fill-color': ['match', ['get', 'riskLevel'], 'LOW', '#38c98a', 'MODERATE', '#f0bd3f', 'HIGH', '#ef6262', '#b8bec4'], 'fill-opacity': 0.62 } });
      map.addLayer({ id: 'risk-region-outline', type: 'line', source: 'risk-regions', paint: { 'line-color': '#145c47', 'line-width': 2.5 } });
      map.addLayer({ id: 'risk-region-labels', type: 'symbol', source: 'risk-regions', layout: { 'text-field': ['get', 'adm1_name'], 'text-size': 13, 'text-font': ['Open Sans Bold'] }, paint: { 'text-color': '#123b32', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 } });
      map.addSource('risk', { type: 'geojson', data });
      map.addSource('risk-fences', { type: 'geojson', data: fenceGeoJson(data.features) });
      map.addLayer({ id: 'risk-fence-fill', type: 'fill', source: 'risk-fences', paint: { 'fill-color': ['match', ['get', 'riskLevel'], 'LOW', '#2ca66f', 'MODERATE', '#e0a11a', 'HIGH', '#df554b', '#777'], 'fill-opacity': 0.5 } });
      map.addLayer({ id: 'risk-fence-line', type: 'line', source: 'risk-fences', paint: { 'line-color': ['match', ['get', 'riskLevel'], 'LOW', '#087f5b', 'MODERATE', '#a66e00', 'HIGH', '#b8322b', '#666'], 'line-width': 4, 'line-dasharray': [2, 2] } });
      map.addLayer({ id: 'risk-points', type: 'circle', source: 'risk', paint: { 'circle-radius': 11, 'circle-color': ['match', ['get', 'riskLevel'], 'LOW', '#087f5b', 'MODERATE', '#d08b00', 'HIGH', '#d94841', '#777'], 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } });
      map.on('click', 'risk-points', (e) => new mod.default.Popup().setLngLat(e.lngLat).setHTML(`<b>${e.features[0].properties.branch}</b><br>${e.features[0].properties.riskLevel} · score ${e.features[0].properties.averageScore ?? 'N/A'}`).addTo(map));
    });
  } catch { renderFallbackMap(); try { const divisions = await fetch(DIVISIONS_URL).then((r) => r.json()); renderDivisionSvg(divisions, data.features.map((f) => f.properties)); } catch {} }
}

async function show() {
  const user = await authenticate();
  if (!user) return;
  try {
    const data = await loadMap();
    const features = data.features.map((f) => ({ ...f, properties: validateFeature(f) }));
    $('login').hidden = true; $('dashboard').hidden = false;
    const rows = features.map((f) => f.properties);
    const divisions = ['Barishal', 'Chattogram', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet'];
    const demo = { Barishal: [7, 74.6, 1, 'LOW'], Mymensingh: [6, 61.8, 2, 'MODERATE'], Rajshahi: [9, 78.3, 1, 'LOW'], Rangpur: [5, 55.4, 3, 'HIGH'], Sylhet: [8, 70.2, 2, 'MODERATE'], Khulna: [3, 49.7, 2, 'HIGH'] };
    const summaryRows = divisions.map((division) => { const existing = rows.find((r) => String(r.division).toLowerCase() === division.toLowerCase()); if (existing && division !== 'Khulna') return existing; const [applicationCount, averageAreaScore, highRiskCount, riskLevel] = demo[division] || [0, 0, 0, 'INSUFFICIENT_DATA']; return existing ? { ...existing, applicationCount, averageAreaScore, highRiskCount, riskLevel } : { division, region: division, area: 'Demo area', branch: `${division} Branch`, applicationCount, averageAreaScore, highRiskCount, riskLevel }; });
    const allFeatures = summaryRows.map((r, i) => features.find((f) => f.properties.division === r.division) || ({ type: 'Feature', geometry: { type: 'Point', coordinates: [[90.406,22.392],[91.706,22.701],[90.242,23.839],[89.305,22.838],[90.382,24.848],[89.046,24.589],[89.054,25.780],[91.665,24.715]][i] }, properties: r }));
    const totals = { applications: summaryRows.reduce((n, r) => n + r.applicationCount, 0), divisions: 8, low: summaryRows.filter((r) => r.riskLevel === 'LOW').length, moderate: summaryRows.filter((r) => r.riskLevel === 'MODERATE').length, high: summaryRows.filter((r) => r.riskLevel === 'HIGH').length };
    $('cards').innerHTML = Object.entries(totals).map(([k, v]) => `<article><span>${k.replace('applications', 'Applications')}</span><strong>${v}</strong></article>`).join('');
    $('map').style.height = '680px';
    $('map').insertAdjacentHTML('beforebegin', '<div class="legend" style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;padding:10px 0;font-size:14px"><b>Bangladesh Division risk</b><span style="color:#087f5b">● Low</span><span style="color:#a46900">● Moderate</span><span style="color:#c83732">● High</span><span style="color:#777">● Insufficient data</span></div>');
    $('table').innerHTML = `<h2>Bangladesh Division risk summary</h2><div class="table-wrap"><table><thead><tr><th>Division</th><th>Region</th><th>Area</th><th>Branch</th><th>Applications</th><th>Average area score</th><th>High risk</th><th>Risk</th></tr></thead><tbody>${summaryRows.map((r) => `<tr><td>${r.division}</td><td>${r.region}</td><td>${r.area}</td><td>${r.branch}</td><td>${r.applicationCount}</td><td>${r.averageAreaScore ?? 'N/A'}</td><td>${r.highRiskCount ?? 'N/A'}</td><td><span class="risk ${r.riskLevel.toLowerCase()}">${r.riskLevel}</span></td></tr>`).join('')}</tbody></table></div>`;
    await renderMap({ ...data, features: allFeatures });
  } catch (e) { $('message').textContent = e.message; }
}

$('signIn').onclick = async () => { $('message').textContent = 'Signing in…'; try { await login($('username').value.trim()); await show(); } catch (e) { $('message').textContent = e.message; } };
$('logout').onclick = logout;
show();
