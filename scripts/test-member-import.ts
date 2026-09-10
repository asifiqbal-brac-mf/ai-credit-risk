import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { Client } from 'pg';
import { assertLocalDemo, importDataset, loadDataset, money, SOURCE, validate } from '../database/scripts/import-20-members';

async function main() {
 process.env.APP_ENV='test';
 const url='postgres://geocredit:geocredit@127.0.0.1:55432/geocredit';
 assertLocalDemo(url);
 const data=await loadDataset();
 assert.equal(money('000500.1'),'500.10');
 assert.throws(()=>money('1.001'));
 assert.throws(()=>assertLocalDemo('postgres://u:p@138.252.125.117:55432/geocredit','demo'));
 assert.throws(()=>assertLocalDemo(url,'production'));
 const invalid=structuredClone(data); invalid.loans[19].member_id='M99999';
 assert.throws(()=>validate(invalid));
 const badDate=structuredClone(data); badDate.loans[19].disbursement_date='2025-02-30';
 assert.throws(()=>validate(badDate));
 const admin=new Client({connectionString:url}); await admin.connect();
 const name='geocredit_import_test_'+randomBytes(6).toString('hex');
 assert.match(name,/^geocredit_import_test_[a-f0-9]{12}$/);
 await admin.query('CREATE DATABASE '+name);
 const client=new Client({connectionString:url.replace(/geocredit$/ ,name)});
 try {
  await client.connect();
  for(const file of (await readdir('database/migrations')).filter(f=>f.endsWith('.sql')).sort()) await client.query(await readFile('database/migrations/'+file,'utf8'));
  for(const file of ['001_demo.sql','002_customer_history.sql']) {
   // Resolved seed names below; no production seed execution.
   const available=await readdir('database/seed');
   const match=available.find(f=>f.startsWith(file.slice(0,3)) && f.endsWith('.sql'))!;
   await client.query(await readFile('database/seed/'+match,'utf8'));
  }
  // Last account conflicts with a non-imported row: earlier member/loan writes must roll back.
  await client.query("INSERT INTO savings_accounts(id,customer_id,account_no,status,product,account_type,installment_amount,principal_amount,balance,source_system) SELECT gen_random_uuid(),id,$1,'ACTIVE','existing','existing',0,0,1,'EXISTING' FROM customers LIMIT 1",[data.savings[19].account_no]);
  await assert.rejects(importDataset(client,data),/non-imported/);
  assert.equal((await client.query('SELECT count(*) FROM customers WHERE source_system=$1',[SOURCE])).rows[0].count,'0');
  assert.equal((await client.query('SELECT count(*) FROM loans WHERE source_system=$1',[SOURCE])).rows[0].count,'0');
  assert.equal((await client.query("SELECT balance FROM savings_accounts WHERE source_system='EXISTING'")).rows[0].balance,'1.00');
  // Remove only our conflict fixture in this disposable test database.
  await client.query("DELETE FROM savings_accounts WHERE source_system='EXISTING'");
  assert.deepEqual(await importDataset(client,data),{customers:20,loans:20,savings_accounts:20});
  const first=(await client.query("SELECT jsonb_agg(to_jsonb(c) ORDER BY id) AS rows FROM customers c")).rows[0].rows;
  assert.deepEqual(await importDataset(client,data),{customers:20,loans:20,savings_accounts:20});
  assert.deepEqual((await client.query("SELECT jsonb_agg(to_jsonb(c) ORDER BY id) AS rows FROM customers c")).rows[0].rows,first);
  assert.equal((await client.query('SELECT count(*) FROM users WHERE source_system=$1',[SOURCE])).rows[0].count,'4');
  assert.equal((await client.query('SELECT count(*) FROM organizations WHERE source_system=$1',[SOURCE])).rows[0].count,'20');
  console.log('PASS: validation, local-only guard, non-owned collision, full rollback, repeat import, counts, stable UUIDs.');
 } finally {
  await client.end();
  // Exact generated isolated test database only; never the demo database.
  await admin.query('DROP DATABASE '+name);
  await admin.end();
 }
}
void main().catch(error=>{console.error(error);process.exitCode=1;});
