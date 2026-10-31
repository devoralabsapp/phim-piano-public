import { describe, it, expect, vi } from 'vitest';
import { Timestamp } from 'firebase/firestore';
vi.mock('../src/lib/firebase',()=>({auth:null,db:null}));
import { sessionDocument, sessionFromDocument } from '../src/lib/cloud-progress';
const session={id:'session-a',lesson_id:'keys',started_at:'2026-10-14T12:00:00.000Z',active_seconds:120,correct_notes:9,wrong_notes:0,completed:true,input_mode:'screen' as const};
describe('Firestore session boundary',()=>{
 it('round-trips timestamps and strips legacy SQL/user fields',()=>{
 const document=sessionDocument({...session,user_id:'another-user',created_at:'ignored'} as typeof session);
 expect(document.started_at).toBeInstanceOf(Timestamp);expect(document).not.toHaveProperty('user_id');expect(document).not.toHaveProperty('created_at');expect(sessionFromDocument(document,session.id)).toEqual(session);
 });
 it('rejects invalid timestamps, mismatched IDs and path injection',()=>{
 expect(sessionFromDocument({...session,started_at:'invalid'},session.id)).toBeNull();expect(sessionFromDocument(sessionDocument(session),'other')).toBeNull();expect(()=>sessionDocument({...session,id:'../../other'})).toThrow();expect(()=>sessionDocument({...session,correct_notes:-1})).toThrow();
 });
});
