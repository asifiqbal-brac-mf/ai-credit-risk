import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('expo-file-system/legacy',()=>({}));
import { GeoCreditMobileClient } from './api';
const response=(data:unknown)=>new Response(JSON.stringify({data}),{headers:{'Content-Type':'application/json'}});
let fetchMock:ReturnType<typeof vi.fn>;
beforeEach(()=>{fetchMock=vi.fn();vi.stubGlobal('fetch',fetchMock);});
it('preserves explicit reviewer version even with an existing draft',async()=>{
 const client=new GeoCreditMobileClient({apiBaseUrl:'http://test'});
 fetchMock.mockResolvedValueOnce(response([])).mockResolvedValueOnce(response({id:'draft',version:1})).mockResolvedValueOnce(response({version:9,currentStatus:'BM_REVIEW'}));
 await client.createDabiDraft({customerId:'c',branchId:'b',areaId:'a',regionId:'r'});
 await client.applyReviewAction('review',8,'START_REVIEW');
 expect(fetchMock.mock.calls[2]?.[1].headers['If-Match']).toBe('8');
});
it('retains a key across uncertain transition retries',async()=>{
 const client=new GeoCreditMobileClient({apiBaseUrl:'http://test'});
 fetchMock.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(response({version:3}));
 await expect(client.applyReviewAction('app',2,'START_REVIEW')).rejects.toThrow('offline');
 await client.applyReviewAction('app',2,'START_REVIEW');
 expect(fetchMock.mock.calls[0]?.[1].headers['Idempotency-Key']).toBe(fetchMock.mock.calls[1]?.[1].headers['Idempotency-Key']);
});
it('rejects non-JSON server responses clearly',async()=>{
 const client=new GeoCreditMobileClient({apiBaseUrl:'http://test'});
 fetchMock.mockResolvedValueOnce(new Response('Not found',{status:404}));
 await expect(client.getReviewInbox()).rejects.toThrow('404');
});
it('clears token and draft on logout',async()=>{
 const client=new GeoCreditMobileClient({apiBaseUrl:'http://test'});
 fetchMock.mockResolvedValueOnce(response({token:'secret',user:{id:'u'}})).mockResolvedValueOnce(response([]));
 await client.login('demo');client.logout();await client.getReviewInbox();
 expect(fetchMock.mock.calls[1]?.[1].headers.Authorization).toBeUndefined();
 await expect(client.submit()).rejects.toThrow('Create a draft');
});
