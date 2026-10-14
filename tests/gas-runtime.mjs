import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createHmac,randomUUID} from 'node:crypto';
export function createGasRuntime({spreadsheetId='test-sheet',seedAccounts=true}={}) {
  const tables=new Map(),props=new Map([['SHARED_SECRET','a'.repeat(64)],['SPREADSHEET_ID','test-sheet']]),cache=new Map();
  if(spreadsheetId===null) props.delete('SPREADSHEET_ID');else props.set('SPREADSHEET_ID',spreadsheetId);
  const openedIds=[];
  class Sheet {
    constructor(){this.data=[];}
    getLastRow(){return this.data.length;}
    appendRow(row){this.data.push([...row]);}
    setFrozenRows(){}
    deleteRow(row){this.data.splice(row-1,1);}
    getRange(row,col,rows=1,cols=1){const self=this;return {
      getValues(){return Array.from({length:rows},(_,i)=>Array.from({length:cols},(_,j)=>self.data[row-1+i]?.[col-1+j] ?? ''));},
      setValues(values){values.forEach((v,i)=>v.forEach((value,j)=>{self.data[row-1+i] ||= [];self.data[row-1+i][col-1+j]=value;}));},
      setValue(value){self.data[row-1][col-1]=value;},setFontWeight(){},
    };}
  }
  const book={getSheetByName:name=>tables.get(name),insertSheet(name){const s=new Sheet();tables.set(name,s);return s;},getId:()=> 'test-sheet',getUrl:()=> 'https://example.invalid/test-sheet'};
  let locked=false;
  const context=vm.createContext({
    PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k),setProperty:(k,v)=>props.set(k,v)})},
    SpreadsheetApp:{openById:id=>{openedIds.push(id);return book;},create:()=>{throw new Error('Setup must use an existing spreadsheet.');},flush:()=>{}},Logger:{log:()=>{}},
    Utilities:{getUuid:randomUUID,Charset:{UTF_8:'UTF-8'},
      computeHmacSha256Signature:(value,key)=>Array.from(createHmac('sha256',key).update(value).digest()),
      base64DecodeWebSafe:value=>Buffer.from(value,'base64url'),newBlob:bytes=>({getDataAsString:()=>Buffer.from(bytes).toString('utf8')})},
    LockService:{getScriptLock:()=>({tryLock:()=>{if(locked)return false;locked=true;return true;},hasLock:()=>locked,releaseLock:()=>{locked=false;}})},
    CacheService:{getScriptCache:()=>({get:key=>cache.get(key)?.expires>Date.now() ? cache.get(key).value : null,put:(key,value,seconds)=>cache.set(key,{value,expires:Date.now()+seconds*1000}),remove:key=>cache.delete(key)})},
    ContentService:{MimeType:{JSON:'application/json'},createTextOutput:text=>({text,setMimeType(){return this;}})},
  });
  vm.runInContext(readFileSync(new URL('../apps-script/app.gs',import.meta.url),'utf8'),context);
  context.setupDiesnat();
  if(seedAccounts) for(const [id,nickname,role] of [['10001','Sandy','user'],['10002','Baraya','user'],['90000','Panitia','admin']])
    tables.get('Accounts').appendRow([id,JSON.stringify(nickname),'scrypt$32768$8$3$'+'0'.repeat(32)+'$'+'0'.repeat(128),role,new Date().toISOString(),new Date().toISOString()]);
  return {context,tables,props,openedIds,cache,call(envelope){return JSON.parse(context.doPost({postData:{contents:JSON.stringify(envelope)}}).text);}};
}
