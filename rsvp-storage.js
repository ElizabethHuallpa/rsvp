/* ===================== RSVP · ALMACENAMIENTO =====================
   Única parte que habla con el exterior. La interfaz solo llama a RSVP_STORAGE.submit(payload).
   Devuelve una promesa:
     { status:'stored' }  → el servidor confirmó que guardó la respuesta (opción B)
     { status:'sent' }    → enviada, pero el destino no permite verificarlo (opción A, Google Forms)
     rechaza con error.code = NOT_CONFIGURED | NETWORK | TIMEOUT | HTTP_xxx | REJECTED
   NO pongas aquí contraseñas ni claves privadas: todo lo que esté en este archivo es público. */
const RSVP_STORAGE=(function(){
  const SETTINGS={
    mode:'endpoint',   // 'none' | 'googleForm' (opción A) | 'endpoint' (opción B)
    googleForm:{   // A: URL que termina en /formResponse y el entry.XXXX de cada pregunta
      action:'',
      fields:{nombre:'',asistencia:'',asistentes:'',autorizados:'',restricciones:'',mensaje:''}
    },
    endpoint:{url:'https://script.google.com/macros/s/AKfycbxhi-Qpsc3PvCqxSyB_zjGVcBqVmAWP-G_Qupn1_M1HaCaat4VRHwhmpDIu7REefeRS/exec',timeoutMs:12000}  // B: URL pública de tu backend (ver apps-script-rsvp.gs)
  };
  const fail=(code,msg)=>{const e=new Error(msg||code);e.code=code;return e};

  async function viaEndpoint(p){
    const cfg=SETTINGS.endpoint; if(!cfg.url)throw fail('NOT_CONFIGURED');
    const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),cfg.timeoutMs);
    try{
      const res=await fetch(cfg.url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(p),signal:ctl.signal,redirect:'follow'});
      if(!res.ok)throw fail('HTTP_'+res.status);
      let data=null;try{data=await res.json()}catch(e){}
      if(!data||data.ok!==true)throw fail('REJECTED',data&&data.error);
      return {status:'stored'};
    }catch(e){ if(e.code)throw e; throw fail(e.name==='AbortError'?'TIMEOUT':'NETWORK'); }
    finally{clearTimeout(timer)}
  }

  async function viaGoogleForm(p){
    const cfg=SETTINGS.googleForm; if(!cfg.action)throw fail('NOT_CONFIGURED');
    const body=new URLSearchParams();
    Object.keys(cfg.fields).forEach(k=>{if(cfg.fields[k])body.append(cfg.fields[k],String(p[k]==null?'':p[k]))});
    try{await fetch(cfg.action,{method:'POST',mode:'no-cors',body})}catch(e){throw fail('NETWORK')}
    return {status:'sent'};   // respuesta opaca: el navegador no deja comprobar que se guardó
  }

  return {submit(p){
    if(SETTINGS.mode==='endpoint')return viaEndpoint(p);
    if(SETTINGS.mode==='googleForm')return viaGoogleForm(p);
    return Promise.reject(fail('NOT_CONFIGURED'));
  }};
})();
