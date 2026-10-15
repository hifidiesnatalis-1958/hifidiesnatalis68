/** Dies Natalis HIFI 68 · server-to-server Google Sheets backend.
 * Script Properties: SHARED_SECRET (>=32 chars), SPREADSHEET_ID.
 * Run setupDiesnat(), then deploy as Web app: Execute as Me, access Anyone.
 * The public deployment accepts data requests only with a valid Vercel HMAC.
 */
var DEFAULT_SPREADSHEET_ID = '1p4-ieKHatSnqblBdOP219ohSOD5jWhK-Xg3z1mWhoMA';
var MENFESS_PATTERNS = null;
var TABLES = {
  Accounts:['id','nickname','passwordHash','role','createdAt','lastLogin','name'],
  Users:['id','email','name','createdAt','lastLogin'],
  Menfess:['id','userId','to','body','anonymous','name','status','createdAt'],
  Likes:['id','postId','userId'],
  Messages:['id','userId','body','anonymous','name','status','createdAt'],
  Tickets:['id','userId','email','name','number','createdAt'],
  Draws:['id','userId','name','number','prize','createdAt'],
  Settings:['key','value']
};

function setupDiesnat() {
  var props = PropertiesService.getScriptProperties();
  if ((props.getProperty('SHARED_SECRET') || '').length < 32) throw new Error('Isi SHARED_SECRET di Script Properties terlebih dahulu.');
  var id = props.getProperty('SPREADSHEET_ID') || DEFAULT_SPREADSHEET_ID;
  var book = SpreadsheetApp.openById(id);
  if (!props.getProperty('SPREADSHEET_ID')) props.setProperty('SPREADSHEET_ID',id);
  Object.keys(TABLES).forEach(function(name) {
    var sheet = book.getSheetByName(name) || book.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(TABLES[name]);sheet.setFrozenRows(1);
      sheet.getRange(1,1,1,TABLES[name].length).setFontWeight('bold');
    } else {
      var header=sheet.getRange(1,1,1,TABLES[name].length).getValues()[0];
      if(name==='Accounts' && header[6]==='' && JSON.stringify(header.slice(0,6))===JSON.stringify(TABLES.Accounts.slice(0,6))) {
        sheet.getRange(1,7).setValue('name');sheet.getRange(1,7).setFontWeight('bold');
      } else if(JSON.stringify(header)!==JSON.stringify(TABLES[name])) {
        throw new Error('Header sheet '+name+' tidak sesuai. Data tidak diubah.');
      }
    }
  });
  if (setting_('raffleOpen') === null) setSetting_('raffleOpen',false);
  Logger.log('Siap. Spreadsheet: '+book.getUrl());
}
function doGet() {return output_({ok:true,service:'HIFI Dies Natalis 68',auth:'npm-password',version:3});}
function doPost(e) {
  var lock;
  MENFESS_PATTERNS=null;
  try {
    var secret = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
    if (!secret || secret.length < 32) fail_('SETUP_REQUIRED','Layanan belum diaktifkan panitia.');
    var envelope = JSON.parse(e.postData.contents || '{}');
    if (!Number.isFinite(envelope.timestamp) || !Number.isInteger(envelope.timestamp) ||
      Math.abs(Date.now()-envelope.timestamp)>300000 || !/^[a-f0-9]{32}$/.test(envelope.nonce || '') ||
      !/^[a-f0-9]{64}$/.test(envelope.signature || '') || typeof envelope.payload !== 'string' ||
      envelope.payload.length>18000 || !/^[A-Za-z0-9_-]+$/.test(envelope.payload)) fail_('UNAUTHORIZED','Permintaan tidak diizinkan.');
    var bytes = Utilities.computeHmacSha256Signature(envelope.timestamp+'.'+envelope.nonce+'.'+envelope.payload,secret,Utilities.Charset.UTF_8);
    var expected = bytes.map(function(b) {return ('0'+((b+256)%256).toString(16)).slice(-2);}).join('');
    var difference = 0;
    for (var i=0;i<expected.length;i++) difference |= expected.charCodeAt(i)^envelope.signature.charCodeAt(i);
    if (difference) fail_('UNAUTHORIZED','Permintaan tidak diizinkan.');
    var payload = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(envelope.payload)).getDataAsString('UTF-8'));
    lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) fail_('RATE_LIMIT','Layanan sedang sibuk. Coba kembali sebentar lagi.');
    var cache = CacheService.getScriptCache();
    if (cache.get('nonce:'+envelope.nonce)) fail_('UNAUTHORIZED','Permintaan sudah digunakan.');
    cache.put('nonce:'+envelope.nonce,'1',300);
    var data = dispatch_(payload.action,payload.actor,payload.data || {});
    SpreadsheetApp.flush();
    return output_({ok:true,data:data});
  } catch(error) {
    return output_({ok:false,error:{code:error.apiCode || 'INTERNAL_ERROR',message:error.apiCode ? error.message : 'Permintaan belum berhasil. Silakan coba kembali.'}});
  } finally {if (lock && lock.hasLock()) lock.releaseLock();}
}
function output_(value) {return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
function fail_(code,message) {var error=new Error(message);error.apiCode=code;throw error;}
function sheet_(name) {
  var id=PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) fail_('SETUP_REQUIRED','Layanan belum diaktifkan panitia.');
  var sheet=SpreadsheetApp.openById(id).getSheetByName(name);
  if (!sheet) fail_('SETUP_REQUIRED','Layanan belum diaktifkan panitia.');
  return sheet;
}
function rows_(name) {
  var sheet=sheet_(name), count=sheet.getLastRow();
  if (count<2) return [];
  return sheet.getRange(2,1,count-1,TABLES[name].length).getValues().map(function(values,index) {
    var row={_row:index+2};TABLES[name].forEach(function(key,i) {row[key]=values[i];});
    if(name==='Accounts') {row.nickname=JSON.parse(row.nickname);row.name=row.name ? JSON.parse(row.name) : '';}
    return row;
  });
}
function plain_(value) {
  if (typeof value==='string' && /^\s*[=+@-]/.test(value)) return "'"+value;
  return value;
}
function append_(table,data) {sheet_(table).appendRow(TABLES[table].map(function(key) {return plain_(data[key]===undefined ? '' : data[key]);}));}
function text_(value,max,required) {
  if (typeof value!=='string') {if(required) fail_('INVALID_REQUEST','Isi pesan belum lengkap.');return '';}
  var clean=value.trim().replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'');
  if (clean.length>max || (required && !clean)) fail_('INVALID_REQUEST','Isi pesan belum lengkap atau terlalu panjang.');
  return clean;
}
function actor_(actor,admin) {
  if (!actor || !/^[A-Za-z0-9_-]{1,128}$/.test(actor.id || '')) fail_('UNAUTHORIZED','Masuk terlebih dahulu.');
  var account=rows_('Accounts').filter(function(r) {return r.id===actor.id && r.nickname===actor.nickname;})[0];
  if(!account) fail_('UNAUTHORIZED','Akun tidak ditemukan. Masuk kembali.');
  if(admin && account.role!=='admin') fail_('FORBIDDEN','Aksi ini khusus panitia.');
  return accountUser_(account);
}
function nickname_(value) {
  var nickname=typeof value==='string' ? value.normalize('NFKC').trim().replace(/\s+/g,' ') : '';
  if(nickname.length<2 || nickname.length>40 || /[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/.test(nickname)) fail_('INVALID_REQUEST','Nickname harus 2–40 karakter. Gunakan nama pilihan kamu.');
  return nickname;
}
function accountUser_(row) {return {id:row.id,nickname:row.nickname,name:row.name || row.nickname,role:row.role};}
function accountNamesReady_() {return sheet_('Accounts').getRange(1,7).getValues()[0][0]==='name';}
function accountName_(value) {
  var name=typeof value==='string' ? value.normalize('NFKC').trim().replace(/\s+/g,' ') : '';
  if(name.length<2 || name.length>100 || /[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/.test(name)) fail_('INVALID_REQUEST','Nama harus 2–100 karakter.');
  return name;
}
function studentNpm_(nickname) {return /^140310(?:0\d|1\d|2[0-5])00\d{2}$/.test(nickname) && !nickname.endsWith('0000');}
function accountByNickname_(nickname) {return rows_('Accounts').filter(function(r) {return r.nickname.toLowerCase()===nickname.toLowerCase();})[0];}
function authRate_(nickname,clientKey,register) {
  if(!/^[a-f0-9]{64}$/.test(clientKey || '')) fail_('INVALID_REQUEST','Permintaan akun tidak sesuai.');
  var cache=CacheService.getScriptCache();
  [{key:'auth:ip:'+clientKey,max:120,seconds:60},{key:'auth:'+ (register ? 'register:' : 'login:')+nickname.toLowerCase(),max:5,seconds:900}].forEach(function(rule) {
    var state=JSON.parse(cache.get(rule.key) || 'null');
    if(!state || state.until<=Date.now()) state={count:0,until:Date.now()+rule.seconds*1000};
    if(state.count>=rule.max) fail_('RATE_LIMIT','Terlalu banyak percobaan. Coba kembali setelah beberapa saat.');
    state.count++;cache.put(rule.key,JSON.stringify(state),rule.seconds);
  });
}
function registerCheck_(nickname) {
  if(accountByNickname_(nickname)) fail_('CONFLICT','Nickname sudah digunakan. Pilih nickname lain.');
}
function createAccount_(nickname,passwordHash,role,now,name) {
  if(!/^scrypt\$32768\$8\$3\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(passwordHash || '')) fail_('INVALID_REQUEST','Permintaan akun tidak sesuai.');
  if(accountByNickname_(nickname)) fail_('CONFLICT','Nickname sudah digunakan.');
  var account={id:Utilities.getUuid(),nickname:nickname,name:name || nickname,passwordHash:passwordHash,role:role,createdAt:now,lastLogin:now};
  // JSON preserves fully custom nicknames (including formula-like text) as literal Sheet cells.
  append_('Accounts',Object.assign({},account,{nickname:JSON.stringify(nickname),name:JSON.stringify(account.name)}));return {user:accountUser_(account)};
}
function setting_(key) {var row=rows_('Settings').filter(function(r) {return r.key===key;})[0];return row ? JSON.parse(row.value) : null;}
function setSetting_(key,value) {
  var row=rows_('Settings').filter(function(r) {return r.key===key;})[0];
  if (row) sheet_('Settings').getRange(row._row,2).setValue(JSON.stringify(value));
  else append_('Settings',{key:key,value:JSON.stringify(value)});
}
function rate_(table,userId) {
  var recent=rows_(table).some(function(row) {return row.userId===userId && Date.now()-new Date(row.createdAt).getTime()<30000;});
  if (recent) fail_('RATE_LIMIT','Tunggu 30 detik sebelum mengirim pesan berikutnya.');
}
function anonymousId_(actor) {
  var secret=PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
  return Utilities.computeHmacSha256Signature('menfess:'+actor.id,secret,Utilities.Charset.UTF_8)
    .map(function(b) {return ('0'+((b+256)%256).toString(16)).slice(-2);}).join('');
}
// Server-side screening complements manual moderation. Never expose flagged text on the projector.
function unsuitableMenfess_(row) {
  function normalize(value) {return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[01345789]/g,function(n) {return {'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','8':'b','9':'g'}[n];});}
  if(!MENFESS_PATTERNS) {
    var extra=PropertiesService.getScriptProperties().getProperty('MENFESS_BLOCKED_WORDS') || '';
    var words=['anjing','anjir','bangsat','bajingan','brengsek','goblok','tolol','bego','kontol','memek','ngentot','ngewe','jancok','jancuk','pantek','kehed','belegug','fuck','shit','bitch','asshole','bunuh kamu','bunuh lo','bunuh lu','bunuh kalian','mati saja','mati aja'].concat(extra.split(',').slice(0,100));
    MENFESS_PATTERNS=words.map(function(word) {
      var letters=normalize(word).replace(/[^a-z]/g,'').slice(0,64);
      if(!letters) return null;
      var pattern=letters.split('').map(function(letter) {return letter+'+';}).join('[^a-z]*');
      return new RegExp('(^|[^a-z])'+pattern+'($|[^a-z])');
    }).filter(Boolean);
  }
  var input=normalize(row.to)+'\n'+normalize(row.body);
  return MENFESS_PATTERNS.some(function(pattern) {return pattern.test(input);});
}
function publicPost_(row,likes,actor,forceAnonymous) {
  var ownLikes=likes.filter(function(like) {return like.postId===row.id;});
  return {id:row.id,to:row.to || '',body:row.body,author:(forceAnonymous || row.anonymous) ? 'Baraya anonim' : row.name,
    status:row.status,createdAt:row.createdAt,likes:ownLikes.length,liked:Boolean(actor && ownLikes.some(function(l) {return l.userId===actor.id;}))};
}
function publicDraw_(row) {return {id:row.id,name:row.name,number:row.number,prize:row.prize,createdAt:row.createdAt};}
function validateContent_(content) {
  if (!content || typeof content!=='object' || Array.isArray(content) || JSON.stringify(content).length>10000) fail_('INVALID_REQUEST','Konten tidak sesuai.');
  ['name','organizer','date','theme','events','dressCode','location','contact','links','raffle'].forEach(function(key) {
    if (!Object.prototype.hasOwnProperty.call(content,key)) fail_('INVALID_REQUEST','Konten belum lengkap: '+key);
  });
  if (![content.theme,content.dressCode,content.location,content.contact,content.links,content.raffle].every(function(v) {return v && typeof v==='object' && !Array.isArray(v);}))
    fail_('INVALID_REQUEST','Struktur konten tidak sesuai.');
  if (!Array.isArray(content.events) || content.events.length>30 || !Array.isArray(content.dressCode.items) || typeof content.theme.title!=='string' || !content.theme.title || !content.location.name)
    fail_('INVALID_REQUEST','Struktur konten tidak sesuai.');
  content.events.forEach(function(event) {
    if (!event || !['id','title','date','time','type','description'].every(function(key) {return typeof event[key]==='string';}) || !event.id || !event.title || !/^\d{4}-\d{2}-\d{2}$/.test(event.date) || !Number.isFinite(new Date(event.date).getTime()))
      fail_('INVALID_REQUEST','Lengkapi nama, tanggal, waktu dan deskripsi setiap acara.');
  });
  content.dressCode.items.forEach(function(item) {if(typeof item!=='string' || item.length>500) fail_('INVALID_REQUEST','Ketentuan busana tidak sesuai.');});
  if (!Number.isFinite(new Date(content.date).getTime())) fail_('INVALID_REQUEST','Tanggal acara tidak sesuai.');
  var urls=content.events.map(function(e) {return e.url;}).concat(Object.keys(content.links).map(function(k) {return content.links[k];}));
  urls.forEach(function(url) {if(url && !/^https:\/\/[^\s]+$/i.test(url)) fail_('INVALID_REQUEST','Tautan harus menggunakan HTTPS.');});
  if (content.contact.phone && !/^\d{8,16}$/.test(content.contact.phone)) fail_('INVALID_REQUEST','Nomor kontak tidak sesuai.');
  return content;
}
function dispatch_(action,actor,data) {
  var now=new Date().toISOString();
  if(action==='auth.status') {rows_('Accounts');return {ready:true,mode:'npm-password',accountNames:accountNamesReady_()};}
  if(action==='auth.checkRegister') {
    var nickname=nickname_(data.nickname);authRate_(nickname,data.clientKey,true);registerCheck_(nickname);return {available:true,accountNames:accountNamesReady_()};
  }
  if(action==='auth.register') {
    var nickname=nickname_(data.nickname);registerCheck_(nickname);
    if(!studentNpm_(nickname)) fail_('INVALID_REQUEST','NPM peserta tidak sesuai ketentuan.');
    if(!accountNamesReady_()) fail_('SETUP_REQUIRED','Jalankan setupDiesnat() untuk menambahkan kolom nama terlebih dahulu.');
    return createAccount_(nickname,data.passwordHash,'user',now,accountName_(data.name));
  }
  if(action==='auth.lookup') {
    var nickname=nickname_(data.nickname);authRate_(nickname,data.clientKey,false);
    var account=accountByNickname_(nickname);
    // Credential hashes are sent only over the authenticated server-to-server bridge.
    return {account:account ? {id:account.id,nickname:account.nickname,name:account.name || account.nickname,passwordHash:account.passwordHash} : null};
  }
  if(action==='auth.login') {
    var nickname=nickname_(data.nickname),account=accountByNickname_(nickname);
    if(!account || account.id!==data.id) fail_('UNAUTHORIZED','Nickname atau password salah.');
    sheet_('Accounts').getRange(account._row,TABLES.Accounts.indexOf('lastLogin')+1).setValue(now);
    CacheService.getScriptCache().remove('auth:login:'+nickname.toLowerCase());
    return {user:accountUser_(account)};
  }
  // No public HTTP route accepts this action. Provision operators from the local CLI.
  if(action==='auth.createAdmin') return createAccount_(nickname_(data.nickname),data.passwordHash,'admin',now);
  if (action==='content.get') return setting_('content') || {};
  if (action==='content.update') {actor_(actor,true);setSetting_('content',validateContent_(data.content));return {saved:true};}
  if (action==='menfess.list') {
    var page=Math.max(1,Math.min(100000,Math.floor(Number(data.page) || 1)));
    var likes=rows_('Likes'), visible=rows_('Menfess').filter(function(r) {return r.status==='approved' && !unsuitableMenfess_(r);}).reverse();
    return {posts:visible.slice((page-1)*12,page*12).map(function(r) {return publicPost_(r,likes,actor,true);}),
      more:visible.length>page*12,page:page,
      mine:actor ? rows_('Menfess').filter(function(r) {return r.userId===anonymousId_(actor) && r.status!=='approved';}).reverse().slice(0,10).map(function(r) {return publicPost_(r,likes,actor,true);}) : []};
  }
  if (action==='menfess.submit' || action==='messages.submit') {
    actor=actor_(actor);var table=action==='menfess.submit' ? 'Menfess' : 'Messages';
    var userId=table==='Menfess' ? anonymousId_(actor) : actor.id;rate_(table,userId);
    var row={id:Utilities.getUuid(),userId:userId,to:table==='Menfess' ? text_(data.to,60,false) : '',
      body:text_(data.body,800,true),anonymous:table==='Menfess' || data.anonymous!==false,
      name:table==='Menfess' ? 'Baraya anonim' : text_(actor.name,100,true),status:'pending',createdAt:now};
    if(table==='Menfess' && unsuitableMenfess_(row)) fail_('INVALID_REQUEST','Pesan atau tujuan mengandung kata kasar atau kalimat yang tidak pantas. Coba tulis kembali dengan bahasa yang lebih baik.');
    append_(table,row);return {id:row.id,status:'pending',message:'Pesan tersimpan dan menunggu persetujuan panitia.'};
  }
  if (action==='menfess.like') {
    actor_(actor);var post=rows_('Menfess').filter(function(r) {return r.id===data.id && r.status==='approved';})[0];
    if(!post || unsuitableMenfess_(post)) fail_('NOT_FOUND','Menfess tidak ditemukan.');
    var all=rows_('Likes'), existing=all.filter(function(r) {return r.postId===post.id && r.userId===actor.id;})[0];
    if(existing) sheet_('Likes').deleteRow(existing._row);else append_('Likes',{id:Utilities.getUuid(),postId:post.id,userId:actor.id});
    return {liked:!existing,likes:all.filter(function(r) {return r.postId===post.id;}).length+(existing ? -1 : 1)};
  }
  if(action==='messages.list') return {messages:rows_('Messages').filter(function(r) {return r.status==='approved';}).reverse().slice(0,30).map(function(r) {return publicPost_(r,[],actor);})};
  if(action==='raffle.status') {
    var tickets=rows_('Tickets');var mine=actor ? tickets.filter(function(r) {return r.userId===actor.id;})[0] : null;
    return {open:setting_('raffleOpen')===true,total:tickets.length,ticket:mine ? {number:mine.number,createdAt:mine.createdAt} : null,
      winners:rows_('Draws').map(publicDraw_)};
  }
  if(action==='raffle.join') {
    actor=actor_(actor);var tickets=rows_('Tickets'), existing=tickets.filter(function(r) {return r.userId===actor.id;})[0];
    if(existing) return {number:existing.number,alreadyRegistered:true};
    if(setting_('raffleOpen')!==true) fail_('CONFLICT','Pendaftaran undian belum dibuka atau sudah ditutup.');
    if(data.consent!==true) fail_('INVALID_REQUEST','Setujui ketentuan undian terlebih dahulu.');
    var ticket={id:Utilities.getUuid(),userId:actor.id,email:'',name:actor.name,number:'DN68-'+('00000'+(tickets.length+1)).slice(-5),createdAt:now};
    append_('Tickets',ticket);return {number:ticket.number,alreadyRegistered:false};
  }
  if(action==='raffle.toggle') {actor_(actor,true);if(typeof data.open!=='boolean') fail_('INVALID_REQUEST','Status tidak sesuai.');setSetting_('raffleOpen',data.open);return {open:data.open};}
  if(action==='raffle.draw') {
    actor_(actor,true);
    if(setting_('raffleOpen')===true) fail_('CONFLICT','Tutup pendaftaran sebelum mengundi.');
    var prize=text_(data.prize,120,true);
    var won=rows_('Draws').map(function(r) {return r.userId;});
    var eligible=rows_('Tickets').filter(function(r) {return won.indexOf(r.userId)<0;});
    if(!eligible.length) fail_('CONFLICT','Tidak ada peserta yang dapat diundi.');
    if(!Array.isArray(data.entropy) || data.entropy.length!==16) fail_('INVALID_REQUEST','Permintaan undian tidak sesuai.');
    // Node crypto supplies independent uint32 values. Rejection sampling avoids modulo bias.
    var ceiling=4294967296-(4294967296%eligible.length), selected=null;
    data.entropy.forEach(function(n) {if(!Number.isInteger(n) || n<0 || n>=4294967296) fail_('INVALID_REQUEST','Permintaan undian tidak sesuai.');if(selected===null && n<ceiling) selected=n%eligible.length;});
    if(selected===null) fail_('CONFLICT','Silakan ulangi pengundian.');
    var winner=eligible[selected];var draw={id:Utilities.getUuid(),userId:winner.userId,name:winner.name,number:winner.number,prize:prize,createdAt:now};
    append_('Draws',draw);return {winner:publicDraw_(draw)};
  }
  if(action==='admin.moderate') {
    actor_(actor,true);var table=data.type==='menfess' ? 'Menfess' : data.type==='messages' ? 'Messages' : null;
    if(!table || ['approved','rejected'].indexOf(data.status)<0) fail_('INVALID_REQUEST','Status moderasi tidak sesuai.');
    var row=rows_(table).filter(function(r) {return r.id===data.id;})[0];if(!row) fail_('NOT_FOUND','Pesan tidak ditemukan.');
    if(table==='Menfess' && data.status==='approved' && unsuitableMenfess_(row)) fail_('INVALID_REQUEST','Pesan terdeteksi mengandung kata yang tidak pantas dan tidak dapat ditampilkan.');
    sheet_(table).getRange(row._row,TABLES[table].indexOf('status')+1).setValue(data.status);return {saved:true};
  }
  if(action==='menfess.presentation') {
    actor_(actor,true);
    var approved=rows_('Menfess').filter(function(r) {return r.status==='approved';});
    var safe=approved.filter(function(r) {return !unsuitableMenfess_(r);});
    return {posts:safe.slice(-500).map(function(r) {return {id:r.id,to:r.to || '',body:r.body,author:'Baraya anonim'};}),
      blocked:approved.length-safe.length,filterActive:true,updatedAt:now};
  }
  if(action==='admin.overview') {
    actor_(actor,true);
    return {content:setting_('content'),raffleOpen:setting_('raffleOpen')===true,totalTickets:rows_('Tickets').length,
      winners:rows_('Draws').map(publicDraw_),
      pending:rows_('Menfess').filter(function(r) {return r.status==='pending';}).map(function(r) {return {id:r.id,type:'menfess',to:r.to,body:r.body,anonymous:true,name:'Baraya anonim',flagged:unsuitableMenfess_(r),createdAt:r.createdAt};})
        .concat(rows_('Messages').filter(function(r) {return r.status==='pending';}).map(function(r) {return {id:r.id,type:'messages',body:r.body,anonymous:r.anonymous,name:r.name,createdAt:r.createdAt};})).reverse()};
  }
  fail_('INVALID_REQUEST','Aksi tidak dikenal.');
}
