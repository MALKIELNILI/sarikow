import { useState } from "react";
import { fmt } from "../helpers.js";
import { mkMonthLabel, trackColor } from "../constants.js";
import { col, card, smallBtn } from "../styles.js";

export default function BankTab({ avrechim, selKey, prevKey, calcAvrechMonth, selYear, selMonth, getAV, setAvMonthField }){
  const [expanded, setExpanded] = useState(false);

  const deposits = avrechim
    .filter(a=>a.active)
    .map(av=>({ av, c:calcAvrechMonth(av,selKey,prevKey) }))
    .filter(({c})=>c.monthly>0||c.holiday>0||c.totalToBank>0);

  const cashList = deposits.filter(({c})=>c.cashAmount>0 && c.taanitAmount===0);

  const owingList = avrechim.filter(a=>a.active).map(av=>({ av, c:calcAvrechMonth(av,selKey,prevKey) })).filter(({c})=>c.totalToBank<0);
  const totalOwing = owingList.reduce((s,{c})=>s+Math.abs(c.totalToBank),0);
  const owingPaidCount = owingList.filter(({av})=>getAV(selKey,av.id,"refundReceived")==="1").length;
  const allOwingPaid   = owingPaidCount===owingList.length && owingList.length>0;

  const taanitList       = avrechim.filter(a=>a.active).map(av=>({ av, c:calcAvrechMonth(av,selKey,prevKey) })).filter(({c})=>c.taanitAmount>0);
  const totalTaanit      = taanitList.reduce((s,{c})=>s+c.taanitAmount,0);
  const taanitPaidCount  = taanitList.filter(({av})=>getAV(selKey,av.id,"taanitPaid")==="1").length;
  const taanitPaidTotal  = taanitList.filter(({av})=>getAV(selKey,av.id,"taanitPaid")==="1").reduce((s,{c})=>s+c.taanitAmount,0);
  const allTaanitPaid    = taanitPaidCount===taanitList.length && taanitList.length>0;

  const totalDeposit   = deposits.reduce((s,{c})=>s+c.totalToBank,0);
  const totalBankXfer  = deposits.reduce((s,{c})=>s+c.bankDeposit,0);
  const totalCash      = cashList.reduce((s,{c})=>s+c.cashAmount,0);
  const totalRounding  = deposits.reduce((s,{c})=>s+c.depositRounding,0);
  const grandTotal     = totalBankXfer + totalCash;

  const totalCount     = deposits.length;
  const sentCount      = deposits.filter(({av})=>getAV(selKey,av.id,"bankRequested")==="1").length;
  const sentTotal      = deposits.filter(({av})=>getAV(selKey,av.id,"bankRequested")==="1")
                                 .reduce((s,{c})=>s+c.bankDeposit,0);
  const pendingBank    = totalBankXfer - sentTotal;
  const allSent        = sentCount===totalCount && totalCount>0;

  const cashPaidCount  = cashList.filter(({av})=>getAV(selKey,av.id,"cashPaid")==="1").length;
  const cashPaidTotal  = cashList.filter(({av})=>getAV(selKey,av.id,"cashPaid")==="1")
                                 .reduce((s,{c})=>s+c.cashAmount,0);
  const allCashPaid    = cashPaidCount===cashList.length && cashList.length>0;

  return (
    <div style={col}>

      {/* כרטיס סיכום כולל */}
      <div style={{background:"linear-gradient(135deg,#1e3a5f,#2563eb)",borderRadius:12,padding:"16px",color:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.18)"}}>
        <div style={{fontSize:12,opacity:.75,marginBottom:4}}>סה״כ תשלומים — {mkMonthLabel(selYear,selMonth)}</div>
        <div style={{fontSize:36,fontWeight:800,marginBottom:8}}>{fmt(grandTotal)} ₪</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          <div style={{background:"rgba(255,255,255,.13)",borderRadius:8,padding:"6px 10px"}}>
            <div style={{fontSize:10,opacity:.75}}>🏦 העברות לבנק</div>
            <div style={{fontWeight:700,fontSize:15}}>{fmt(totalBankXfer)} ₪</div>
          </div>
          <div style={{background:"rgba(255,255,255,.13)",borderRadius:8,padding:"6px 10px"}}>
            <div style={{fontSize:10,opacity:.75}}>💵 מזומן</div>
            <div style={{fontWeight:700,fontSize:15}}>{fmt(totalCash)} ₪</div>
          </div>
          {totalTaanit>0&&(
            <div style={{background:"rgba(255,255,255,.13)",borderRadius:8,padding:"6px 10px",gridColumn:"1/-1"}}>
              <div style={{fontSize:10,opacity:.75}}>🤫 תענית דיבור (מזומן)</div>
              <div style={{fontWeight:700,fontSize:15}}>{fmt(totalTaanit)} ₪</div>
            </div>
          )}
          {totalRounding>0&&(
            <div style={{background:"rgba(255,255,255,.13)",borderRadius:8,padding:"6px 10px",gridColumn:"1/-1"}}>
              <div style={{fontSize:10,opacity:.75}}>⭕ עיגול סריקוב החודש</div>
              <div style={{fontWeight:700,fontSize:15}}>{fmt(totalRounding)} ₪</div>
            </div>
          )}
        </div>
      </div>

      {/* כרטיס אברכים שצריכים להחזיר */}
      {owingList.length>0&&(
        <div style={{...card,background:allOwingPaid?"#f0fdf4":"#fef2f2",border:`2px solid ${allOwingPaid?"#16a34a":"#f87171"}`}}>
          <div style={{fontWeight:700,fontSize:14,color:allOwingPaid?"#166534":"#dc2626",marginBottom:8}}>
            {allOwingPaid?"✅ כל ההחזרים התקבלו":"⚠️ אברכים שצריכים להחזיר"}
            <span style={{fontSize:11,fontWeight:400,marginRight:6,color:"#64748b"}}>
              ({owingPaidCount}/{owingList.length} התקבלו — {fmt(totalOwing)} ₪ סה״כ)
            </span>
          </div>
          {owingList.map(({av,c})=>{
            const received = getAV(selKey,av.id,"refundReceived")==="1";
            return (
              <div key={av.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"7px 8px",borderRadius:8,marginBottom:4,
                background:received?"#dcfce7":"#fff",border:`1px solid ${received?"#86efac":"#fecaca"}`,
                opacity:received?.65:1,transition:"all .2s"}}>
                <div>
                  <span style={{fontWeight:700,fontSize:14}}>{av.name}</span>
                  {received&&<span style={{fontSize:11,color:"#16a34a",marginRight:6,fontWeight:600}}> ✓ התקבל</span>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontWeight:800,fontSize:16,color:"#dc2626"}}>{fmt(Math.abs(c.totalToBank))} ₪</span>
                  <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",
                    background:received?"#16a34a":"#f1f5f9",border:`2px solid ${received?"#16a34a":"#cbd5e1"}`,
                    borderRadius:7,padding:"4px 10px",fontSize:12,fontWeight:600,
                    color:received?"#fff":"#64748b",transition:"all .2s",userSelect:"none"}}>
                    <input type="checkbox"
                      checked={received}
                      onChange={e=>setAvMonthField(selKey,av.id,"refundReceived",e.target.checked?"1":"")}
                      style={{width:15,height:15,cursor:"pointer",accentColor:"#16a34a"}}/>
                    התקבל
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* כרטיס מזומן */}
      {cashList.length>0&&(
        <div style={{...card,background:allCashPaid?"#f0fdf4":"#fefce8",border:`2px solid ${allCashPaid?"#16a34a":"#fbbf24"}`}}>
          <div style={{fontWeight:700,fontSize:14,color:allCashPaid?"#166534":"#92400e",marginBottom:8}}>
            {allCashPaid?"✅ כל המזומן שולם":"💵 תשלומי מזומן"}
            <span style={{fontSize:11,fontWeight:400,marginRight:6,color:"#64748b"}}>
              ({cashPaidCount}/{cashList.length} שולמו — {fmt(cashPaidTotal)} ₪)
            </span>
          </div>
          {cashList.map(({av,c})=>{
            const paid = getAV(selKey,av.id,"cashPaid")==="1";
            return (
              <div key={av.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"7px 8px",borderRadius:8,marginBottom:4,
                background:paid?"#dcfce7":"#fff",border:`1px solid ${paid?"#86efac":"#e2e8f0"}`,
                opacity:paid?.65:1,transition:"all .2s"}}>
                <div>
                  <span style={{fontWeight:700,fontSize:14}}>{av.name}</span>
                  {paid&&<span style={{fontSize:11,color:"#16a34a",marginRight:6,fontWeight:600}}> ✓ שולם</span>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontWeight:800,fontSize:16,color:"#b45309"}}>{fmt(c.cashAmount)} ₪</span>
                  <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",
                    background:paid?"#16a34a":"#f1f5f9",border:`2px solid ${paid?"#16a34a":"#cbd5e1"}`,
                    borderRadius:7,padding:"4px 10px",fontSize:12,fontWeight:600,
                    color:paid?"#fff":"#64748b",transition:"all .2s",userSelect:"none"}}>
                    <input type="checkbox"
                      checked={paid}
                      onChange={e=>setAvMonthField(selKey,av.id,"cashPaid",e.target.checked?"1":"")}
                      style={{width:15,height:15,cursor:"pointer",accentColor:"#16a34a"}}/>
                    שולם
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* כרטיס תענית דיבור */}
      {taanitList.length>0&&(
        <div style={{...card,background:allTaanitPaid?"#f0f9ff":"#e0f2fe",border:`2px solid ${allTaanitPaid?"#0369a1":"#7dd3fc"}`}}>
          <div style={{fontWeight:700,fontSize:14,color:allTaanitPaid?"#075985":"#0369a1",marginBottom:8}}>
            {allTaanitPaid?"✅ כל תענית דיבור שולמה":"🤫 תענית דיבור — מזומן"}
            <span style={{fontSize:11,fontWeight:400,marginRight:6,color:"#64748b"}}>
              ({taanitPaidCount}/{taanitList.length} שולמו — {fmt(taanitPaidTotal)} ₪)
            </span>
          </div>
          {taanitList.map(({av,c})=>{
            const paid = getAV(selKey,av.id,"taanitPaid")==="1";
            const combined = c.taanitAmount + c.cashAmount;
            return (
              <div key={av.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"7px 8px",borderRadius:8,marginBottom:4,
                background:paid?"#dbeafe":"#fff",border:`1px solid ${paid?"#93c5fd":"#e2e8f0"}`,
                opacity:paid?.65:1,transition:"all .2s"}}>
                <div>
                  <span style={{fontWeight:700,fontSize:14}}>{av.name}</span>
                  {paid&&<span style={{fontSize:11,color:"#0369a1",marginRight:6,fontWeight:600}}> ✓ קיבל</span>}
                  <div style={{fontSize:11,color:"#64748b"}}>
                    {c.taanitDays} ימים × 15 ₪{c.cashAmount>0&&` + ${fmt(c.cashAmount)} ₪ מזומן`}
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontWeight:800,fontSize:16,color:"#0369a1"}}>{fmt(combined)} ₪</span>
                  <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",
                    background:paid?"#0369a1":"#f1f5f9",border:`2px solid ${paid?"#0369a1":"#cbd5e1"}`,
                    borderRadius:7,padding:"4px 10px",fontSize:12,fontWeight:600,
                    color:paid?"#fff":"#64748b",transition:"all .2s",userSelect:"none"}}>
                    <input type="checkbox"
                      checked={paid}
                      onChange={e=>{const v=e.target.checked?"1":""; setAvMonthField(selKey,av.id,"taanitPaid",v); if(c.cashAmount>0) setAvMonthField(selKey,av.id,"cashPaid",v);}}
                      style={{width:15,height:15,cursor:"pointer",accentColor:"#0369a1"}}/>
                    {paid?"שולם":"סמן"}
                  </label>
                </div>
              </div>
            );
          })}
          <div style={{marginTop:8,paddingTop:6,borderTop:"1px solid #bae6fd",display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:13,fontWeight:700,color:"#0369a1"}}>סה״כ תענית דיבור</span>
            <span style={{fontSize:15,fontWeight:800,color:"#0369a1"}}>{fmt(totalTaanit)} ₪</span>
          </div>
        </div>
      )}

      {/* כרטיס העברות בנק */}
      {totalCount>0&&(
        <div style={{...card,background:allSent?"#f0fdf4":"#fffbeb",border:`2px solid ${allSent?"#16a34a":"#f59e0b"}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14,color:allSent?"#166534":"#92400e",marginBottom:6}}>
                {allSent?"✅ כל הדרישות נשלחו":"🏦 העברות לבנק"}
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",fontSize:12}}>
                <div style={{background:allSent?"#dcfce7":"#fef9c3",borderRadius:7,padding:"3px 10px"}}>
                  <span style={{color:"#64748b"}}>נשלחו </span>
                  <span style={{fontWeight:700,color:allSent?"#166534":"#92400e"}}>{sentCount}/{totalCount}</span>
                </div>
                {sentTotal>0&&<div style={{background:"#dcfce7",borderRadius:7,padding:"3px 10px"}}>
                  <span style={{color:"#64748b"}}>הועבר </span>
                  <span style={{fontWeight:700,color:"#166534"}}>{fmt(sentTotal)} ₪</span>
                </div>}
                {pendingBank>0&&<div style={{background:"#fef9c3",borderRadius:7,padding:"3px 10px"}}>
                  <span style={{color:"#64748b"}}>ממתין </span>
                  <span style={{fontWeight:700,color:"#b45309"}}>{fmt(pendingBank)} ₪</span>
                </div>}
              </div>
            </div>
            <button onClick={()=>setExpanded(v=>!v)}
              style={{background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:8,padding:"6px 14px",
                fontSize:12,fontWeight:600,cursor:"pointer",color:"#374151",whiteSpace:"nowrap"}}>
              {expanded?"▲ כווץ":"▼ הרחב"}
            </button>
          </div>
        </div>
      )}

      {/* רשימת אברכים (מורחב) */}
      {expanded && deposits.length===0 &&
        <div style={{...card,color:"#94a3b8",textAlign:"center"}}>אין נתוני הפקדה לחודש זה</div>}
      {expanded && deposits.map(({av,c})=>(
        <div key={av.id} style={{...card,borderRight:`4px solid ${trackColor[av.track]||"#64748b"}`,opacity:getAV(selKey,av.id,"bankRequested")==="1"?0.6:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontWeight:700,fontSize:15}}>{av.name}</span>
                {getAV(selKey,av.id,"bankRequested")==="1"&&
                  <span style={{fontSize:11,background:"#dcfce7",color:"#166534",borderRadius:10,padding:"2px 8px",fontWeight:600}}>✓ נשלחה דרישה</span>}
              </div>
              <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap",fontSize:12,color:"#64748b"}}>
                <span>בסיס: {fmt(c.effectiveBank)} ₪</span>
                {c.holiday>0&&<span style={{color:"#b45309",fontWeight:600}}>+ חג: {fmt(c.holiday)} ₪</span>}
                {c.depositRounding>0&&<span style={{color:"#7c3aed",fontWeight:600}}>+ עיגול: {fmt(c.depositRounding)} ₪</span>}
              </div>
              {c.cashAmount>0&&(
                <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
                  <div style={{background:"#eff6ff",borderRadius:8,padding:"4px 10px",fontSize:12}}>
                    <span style={{color:"#64748b"}}>🏦 בנק: </span>
                    <span style={{fontWeight:700,color:"#0369a1"}}>{fmt(c.bankDeposit)} ₪</span>
                  </div>
                  <div style={{background:"#fefce8",borderRadius:8,padding:"4px 10px",fontSize:12}}>
                    <span style={{color:"#64748b"}}>💵 מזומן: </span>
                    <span style={{fontWeight:700,color:"#b45309"}}>{fmt(c.cashAmount)} ₪</span>
                  </div>
                </div>
              )}
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
              <div style={{fontWeight:800,fontSize:20,color:"#059669"}}>{fmt(c.totalToBank)} ₪</div>
              {c.actualBank!=null&&(
                <div style={{fontSize:11,color:c.bankGap===0?"#16a34a":c.bankGap>0?"#dc2626":"#2563eb",fontWeight:600}}>
                  {c.bankGap===0?"✓ שולם":c.bankGap>0?`חסר ${fmt(c.bankGap)} ₪`:`עודף ${fmt(Math.abs(c.bankGap))} ₪`}
                </div>
              )}
              {c.totalToBank>0 && (
                c.cashAmount>=c.totalToBank ? (
                  <button onClick={()=>{setAvMonthField(selKey,av.id,"bankDeposit","");setAvMonthField(selKey,av.id,"bankRequested","");}}
                    style={{background:"#fefce8",border:"1.5px solid #fbbf24",borderRadius:8,padding:"4px 10px",
                      fontSize:12,fontWeight:600,cursor:"pointer",color:"#92400e"}}>
                    ↩ העבר לבנק
                  </button>
                ) : (
                  <button onClick={()=>{setAvMonthField(selKey,av.id,"bankDeposit","0");setAvMonthField(selKey,av.id,"bankRequested","1");}}
                    style={{background:"#eff6ff",border:"1.5px solid #93c5fd",borderRadius:8,padding:"4px 10px",
                      fontSize:12,fontWeight:600,cursor:"pointer",color:"#1d4ed8"}}>
                    💵 העבר למזומן
                  </button>
                )
              )}
              <label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",userSelect:"none",
                background:getAV(selKey,av.id,"bankRequested")==="1"?"#dcfce7":"#f1f5f9",
                border:`2px solid ${getAV(selKey,av.id,"bankRequested")==="1"?"#16a34a":"#cbd5e1"}`,
                borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:600,
                color:getAV(selKey,av.id,"bankRequested")==="1"?"#166534":"#64748b",
                transition:"all .2s"}}>
                <input type="checkbox"
                  checked={getAV(selKey,av.id,"bankRequested")==="1"}
                  onChange={e=>setAvMonthField(selKey,av.id,"bankRequested",e.target.checked?"1":"")}
                  style={{width:16,height:16,cursor:"pointer",accentColor:"#16a34a"}}/>
                נשלחה דרישה
              </label>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
