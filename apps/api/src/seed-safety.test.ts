import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
it('seed SQL never resets existing application workflow status',()=>{
 const directory=resolve(__dirname,'../../../database/seed');
 for(const file of readdirSync(directory).filter(file=>file.endsWith('.sql'))){
   const sql=readFileSync(resolve(directory,file),'utf8');
   expect(sql).not.toMatch(/UPDATE\s+applications\s+SET\s+status\s*=/i);
   expect(sql).not.toMatch(/ON\s+CONFLICT[^;]*DO\s+UPDATE\s+SET\s+status\s*=/i);
 }
});
