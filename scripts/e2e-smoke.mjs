import assert from 'node:assert/strict';

if (process.env.E2E_ALLOW_MUTATIONS !== 'true') throw new Error('Use an isolated test database and set E2E_ALLOW_MUTATIONS=true');
const apiBase = process.env.API_BASE_URL ?? 'http://localhost:3001';
const ids = { customerId: '20000000-0000-0000-0000-000000000001', branchId: '00000000-0000-0000-0000-000000000001', areaId: '00000000-0000-0000-0000-000000000011', regionId: '00000000-0000-0000-0000-000000000111', mediaId: '40000000-0000-0000-0000-000000000001' };

async function request(path, { token, version, idempotencyKey, method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (version !== undefined) headers['If-Match'] = String(version);
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  const response = await fetch(`${apiBase}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const payload = await response.json();
  assert.equal(response.ok, true, `${method} ${path} failed: ${JSON.stringify(payload)}`);
  return payload.data;
}

const login = async username => request('/api/v1/auth/login', { method: 'POST', body: { username } });
const cdo = await login('cdo.demo');
const draft = await request('/api/v1/applications', { token: cdo.token, method: 'POST', body: { ...ids, product: 'DABI' } });
let version = draft.version;
const appId = draft.id;

const scoringInput={incomeSource:{monthlyIncome:'25000',monthlyExpense:'15000',monthlyDebtPayment:'0',stability:'STABLE'},socialAcceptance:{rating:8},houseInfrastructure:{structure:'DURABLE',condition:'GOOD',basicUtilities:true}};
async function assess(token,role){const saved=await request(`/api/v1/applications/${appId}/assessments/${role}`,{token,version,idempotencyKey:`e2e-score-${role}-${appId}`,method:'PUT',body:scoringInput});version=saved.version;assert.notEqual(saved.result.classification,'INCOMPLETE');await request(`/api/v1/applications/${appId}/checklists`,{token,version,method:'PUT',body:{checklistType:role,items:['IDENTITY_VERIFIED','EVIDENCE_REVIEWED','FINANCIALS_CONFIRMED'].map(code=>({code,label:code,complete:true}))}});}

const now = new Date().toISOString();
const geo = await request(`/api/v1/applications/${appId}/geo-verification`, { token: cdo.token, version, method: 'POST', body: { mediaId: ids.mediaId, latitude: 23.78, longitude: 90.279, accuracyMeters: 10, capturedAt: now } });
assert.equal(geo.status, 'VALID');
assert.equal(geo.version, version, 'GPS must return the unchanged application version');
const financial = await request(`/api/v1/applications/${appId}/financial-assessment`, { token: cdo.token, version, method: 'PUT', body: { monthlyIncome: 25000, monthlyExpense: 15000, externalDebt: 0, proposedAmount: 30000, proposedTermMonths: 12 } });
version = financial.version;
const area = await request(`/api/v1/applications/${appId}/area-intelligence`, { token: cdo.token, version, method: 'POST', body: {} });
assert.equal(area.outcome, 'READY');
assert.equal(area.metrics.borrowerCount, 5);
await assess(cdo.token,'CDO');

const submitKey = `e2e-submit-${appId}`;
let action = await request(`/api/v1/applications/${appId}/transitions`, { token: cdo.token, version, idempotencyKey: submitKey, method: 'POST', body: { action: 'SUBMIT' } });
assert.equal(action.currentStatus, 'SUBMITTED_BY_CDO');
version = action.version;

const bm = await login('bm.demo');
let inbox = await request('/api/v1/review/inbox', { token: bm.token });
assert.ok(inbox.some(item => item.id === appId));
action = await request(`/api/v1/applications/${appId}/transitions`, { token: bm.token, version, idempotencyKey: `e2e-bm-start-${appId}`, method: 'POST', body: { action: 'START_REVIEW' } });
version = action.version;
await assess(bm.token,'BM');
action = await request(`/api/v1/applications/${appId}/transitions`, { token: bm.token, version, idempotencyKey: `e2e-bm-recommend-${appId}`, method: 'POST', body: { action: 'RECOMMEND' } });
version = action.version;

const am = await login('am.demo');
inbox = await request('/api/v1/review/inbox', { token: am.token });
assert.ok(inbox.some(item => item.id === appId));
action = await request(`/api/v1/applications/${appId}/transitions`, { token: am.token, version, idempotencyKey: `e2e-am-start-${appId}`, method: 'POST', body: { action: 'START_REVIEW' } });
version = action.version;
action = await request(`/api/v1/applications/${appId}/transitions`, { token: am.token, version, idempotencyKey: `e2e-am-recommend-${appId}`, method: 'POST', body: { action: 'RECOMMEND' } });
version = action.version;

const rm = await login('rm.demo');
inbox = await request('/api/v1/review/inbox', { token: rm.token });
assert.ok(inbox.some(item => item.id === appId));
action = await request(`/api/v1/applications/${appId}/transitions`, { token: rm.token, version, idempotencyKey: `e2e-rm-start-${appId}`, method: 'POST', body: { action: 'START_REVIEW' } });
version = action.version;
action = await request(`/api/v1/applications/${appId}/transitions`, { token: rm.token, version, idempotencyKey: `e2e-rm-approve-${appId}`, method: 'POST', body: { action: 'APPROVE', confirmed: true } });
assert.equal(action.currentStatus, 'APPROVED');
// Retain the original request version for replay.
const replay = await request(`/api/v1/applications/${appId}/transitions`, { token: rm.token, version, idempotencyKey: `e2e-rm-approve-${appId}`, method: 'POST', body: { action: 'APPROVE', confirmed: true } });
assert.equal(replay.currentStatus, 'APPROVED');
const timeline = await request(`/api/v1/applications/${appId}/timeline`, { token: rm.token });
assert.equal(timeline.length, 7);
console.log(JSON.stringify({ ok: true, applicationId: appId, finalStatus: 'APPROVED', timelineActions: timeline.length, idempotentReplay: true }));
