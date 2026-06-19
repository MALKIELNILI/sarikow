import { useState } from "react";
import { th, td, iinp, primaryBtn, grayBtn } from "../styles.js";

export default function ImportModal({ avrechim, selKey, setAvMonthField, onClose }){
  const [jbData,setJbData]=useState(null);
  const [rows,setRows]=useState([]);
  const [importing,setImporting]=useState(false);

  const loadFile = e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try{
        const data = JSON.parse(ev.target.result);
        if(!data.workers) throw new Error('Invalid');
        const matched = data.workers.map(w=>{
          let av = avrechim.find(a=>a.active && a.name===w.name);
          if(!av){
            const parts = w.name.trim().split(/\s+/);
            av = avrechim.find(a=>a.active && parts.some(p=>p.length>2 && a.name.includes(p)));
          }
          const jbSalary = w.salary ? Math.round(w.salary) : null;
          const maxS = av?Number(av.maxStipend||1600):0;
          const calc = jbSalary !== null ? jbSalary
                     : av ? Math.round(w.days/data.total_days*maxS) : 0;
          return { jbName:w.name, jbId:w.jb_id, days:w.days, pct:w.pct,
                   jbSalary, avId:av?av.id:null, stipend:calc, skip:false };
        });
        setJbData(data);
        setRows(matched);
      }catch(e){ alert('שגיאה בקריאת הקובץ — ודא שהרצת jb_export.py'); }
    };
    reader.readAsText(file,'utf-8');
  };

  const updRow=(i,patch)=>setRows(r=>r.map((x,j)=>j===i?{...x,...patch}:x));
  const recalc=(i,avId)=>{
    const av=avrechim.find(a=>a.id===avId);
    const maxS=av?Number(av.maxStipend||1600):0;
    const calc=jbData?Math.round(rows[i].days/jbData.total_days*maxS):0;
    updRow(i,{avId,stipend:calc});
  };

  const doImport=()=>{
    setImporting(true);
    rows.filter(r=>!r.skip&&r.avId&&r.stipend>0).forEach(r=>{
      setAvMonthField(selKey,r.avId,'monthlyStipend',r.stipend);
    });
    setTimeout(()=>{ setImporting(false); onClose(); },800);
  };

  const matched   = rows.filter(r=>!r.skip&&r.avId).length;
  const unmatched = rows.filter(r=>!r.avId).length;
  const fromXLS   = jbData&&rows.length>0&&rows[0].jbSalary!==null;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:12}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:14,width:"100%",maxWidth:680,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"14px 18px",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontWeight:700,fontSize:16}}>📥 ייבוא נוכחות מ-JB</div>
            {jbData&&<div style={{fontSize:12,color:"#64748b",marginTop:2}}>
              תקופה: {jbData.period} | {jbData.total_days} ימי עבודה
              {fromXLS
                ? <span style={{marginRight:8,background:"#dcfce7",color:"#16a34a",borderRadius:6,padding:"1px 6px",fontWeight:600}}>✓ סכומים מדויקים מ-JB</span>
                : <span style={{marginRight:8,background:"#fef9c3",color:"#92400e",borderRadius:6,padding:"1px 6px"}}>חישוב לפי ימים</span>}
            </div>}
          </div>
          <button style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#64748b"}} onClick={onClose}>✕</button>
        </div>

        {!jbData?(
          <div style={{padding:24,display:"flex",flexDirection:"column",gap:16}}>
            <div style={{background:"#f0f9ff",borderRadius:10,padding:14,fontSize:13,lineHeight:1.7}}>
              <div style={{fontWeight:700,marginBottom:6}}>הוראות:</div>
              <div>1️⃣ פתח שורת פקודה (cmd) והרץ:</div>
              <div style={{fontFamily:"monospace",background:"#1e293b",color:"#7dd3fc",padding:"6px 10px",borderRadius:6,margin:"4px 0",fontSize:12}}>
                python C:\JBCLOCK\jb_export.py 26 3
              </div>
              <div style={{fontSize:11,color:"#64748b"}}>(שנה את 26 3 לשנה ולחודש הרצויים)</div>
              <div style={{marginTop:6}}>2️⃣ לאחר הרצה — לחץ "טען קובץ" ובחר <strong>C:\JBCLOCK\jb_data.json</strong></div>
            </div>
            <label style={{...primaryBtn,textAlign:"center",cursor:"pointer",display:"block"}}>
              📂 טען קובץ jb_data.json
              <input type="file" accept=".json" style={{display:"none"}} onChange={loadFile}/>
            </label>
          </div>
        ):(
          <>
            <div style={{overflowY:"auto",flex:1}}>
              {unmatched>0&&(
                <div style={{margin:"8px 12px",background:"#fef2f2",borderRadius:8,padding:"7px 12px",fontSize:12,color:"#dc2626"}}>
                  ⚠️ {unmatched} עובדים לא זוהו — בחר אברך ידנית בשורות המסומנות
                </div>
              )}
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead style={{position:"sticky",top:0,background:"#f8fafc"}}>
                  <tr>
                    <th style={{...th,padding:"7px 8px"}}>שם JB</th>
                    <th style={{...th,padding:"7px 8px"}}>ימים</th>
                    <th style={{...th,padding:"7px 8px"}}>%</th>
                    <th style={{...th,padding:"7px 8px",minWidth:120}}>אברך במערכת</th>
                    <th style={{...th,padding:"7px 8px"}}>מגיע לו (₪)</th>
                    <th style={{...th,padding:"7px 8px"}}>דלג</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid #f1f5f9",background:r.skip?"#f8fafc":r.avId?"#fff":"#fef2f2",opacity:r.skip?0.45:1}}>
                      <td style={{...td,padding:"5px 8px",fontWeight:600}}>{r.jbName}</td>
                      <td style={{...td,padding:"5px 8px",textAlign:"center",color:"#475569"}}>{r.days}/{jbData.total_days}</td>
                      <td style={{...td,padding:"5px 8px",textAlign:"center",fontWeight:r.pct>=80?"700":"400",color:r.pct>=80?"#16a34a":r.pct>=50?"#d97706":"#dc2626"}}>{r.pct}%</td>
                      <td style={{...td,padding:"4px 6px"}}>
                        <select style={{...iinp,fontSize:11,color:r.avId?"#1e293b":"#dc2626"}}
                          value={r.avId||""}
                          onChange={e=>recalc(i,e.target.value?Number(e.target.value):null)}>
                          <option value="">-- לא מותאם --</option>
                          {avrechim.filter(a=>a.active).map(a=>(
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{...td,padding:"4px 6px"}}>
                        <input style={{...iinp,textAlign:"left",width:70,color:r.avId?"#1e293b":"#94a3b8"}}
                          type="number" value={r.stipend}
                          onChange={e=>updRow(i,{stipend:Number(e.target.value)})}
                          disabled={!r.avId||r.skip}/>
                      </td>
                      <td style={{...td,padding:"4px 8px",textAlign:"center"}}>
                        <input type="checkbox" checked={r.skip} onChange={e=>updRow(i,{skip:e.target.checked})}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{padding:"12px 16px",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,gap:10}}>
              <div style={{fontSize:13,color:"#475569"}}>
                <span style={{color:"#16a34a",fontWeight:700}}>{matched}</span> אברכים יוזנו
                {unmatched>0&&<span style={{color:"#dc2626",marginRight:8}}> | {unmatched} לא מותאמים</span>}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button style={grayBtn} onClick={onClose}>ביטול</button>
                <button style={{...primaryBtn,width:"auto",padding:"9px 20px",opacity:matched===0||importing?0.6:1}}
                  disabled={matched===0||importing}
                  onClick={doImport}>
                  {importing?"מייבא...":"✅ ייבא "+matched+" אברכים"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
