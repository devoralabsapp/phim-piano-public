import { after, before, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, getDocs, collection, updateDoc, deleteDoc, deleteField, Timestamp } from 'firebase/firestore';
let env;
const base = { id:'session-a', lesson_id:'keys', started_at:Timestamp.fromDate(new Date('2026-10-14T12:00:00Z')), active_seconds:120, correct_notes:9, wrong_notes:1, completed:true, input_mode:'screen' };
const ref=(ctx,uid='owner',id='session-a')=>doc(ctx.firestore(),'users',uid,'sessions',id);
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-piano-sprout',firestore:{host:'127.0.0.1',port:8080,rules:await readFile('firestore.rules','utf8')}});});
after(async()=>{await env?.cleanup();});
test('owner reads collection and creates/updates valid progress',async()=>{
 const ctx=env.authenticatedContext('owner');await assertSucceeds(setDoc(ref(ctx),base));await assertSucceeds(getDocs(collection(ctx.firestore(),'users','owner','sessions')));await assertSucceeds(updateDoc(ref(ctx),{active_seconds:180}));
});
test('guest and another account cannot read, query, create, update or delete owner progress',async()=>{
 for(const ctx of [env.unauthenticatedContext(),env.authenticatedContext('stranger')]){
  await assertFails(getDoc(ref(ctx)));await assertFails(getDocs(collection(ctx.firestore(),'users','owner','sessions')));await assertFails(setDoc(ref(ctx),base));await assertFails(updateDoc(ref(ctx),{correct_notes:20}));await assertFails(deleteDoc(ref(ctx)));
 }
});
test('both create and update reject invalid or polluted data',async()=>{
 const ctx=env.authenticatedContext('owner');
 for(const patch of [{active_seconds:-1},{correct_notes:1.5},{wrong_notes:'9'},{input_mode:'admin'},{isAdmin:true},{lesson_id:'x'.repeat(1000000)},{completed:'true'},{assessment:{kind:'rhythm'}},{started_at:'2026-10-14'}]){
  await assertFails(setDoc(ref(ctx,'owner','invalid'),{...base,id:'invalid',...patch}));await assertFails(updateDoc(ref(ctx),patch));
 }
 const {completed,...missing}=base;await assertFails(setDoc(ref(ctx,'owner','missing'),{...missing,id:'missing'}));await assertFails(updateDoc(ref(ctx),{completed:deleteField()}));
});
test('immutable fields, decreasing progress and client deletion are denied',async()=>{
 const ctx=env.authenticatedContext('owner');
 for(const patch of [{id:'changed'},{lesson_id:'joy'},{started_at:Timestamp.now()},{active_seconds:1},{completed:false}])await assertFails(updateDoc(ref(ctx),patch));
 await assertFails(deleteDoc(ref(ctx)));await assertFails(setDoc(doc(ctx.firestore(),'users','owner'),{role:'admin'}));await assertFails(getDocs(collection(ctx.firestore(),'users')));
});
test('bounded optional assessment is accepted; invalid results are rejected',async()=>{
 const ctx=env.authenticatedContext('owner');const assessment={kind:'rhythm',bpm:60,pitchAccuracy:100,timingAccuracy:90,score:95,early:0,late:1,missed:0,extra:0,start:0,end:8,hand:'all',input:'screen'};
 await assertSucceeds(updateDoc(ref(ctx),{assessment}));
 for(const patch of [{score:101},{bpm:0},{end:-1},{hand:'other'},{durationAccuracy:200},{extraData:'x'}])await assertFails(updateDoc(ref(ctx),{assessment:{...assessment,...patch}}));
});
