import { useState } from "react";
import { fmt } from "../helpers.js";
import { col, card, inp, primaryBtn, smallBtn } from "../styles.js";
import { mkMonthLabel } from "../constants.js";

export default function SettlementTab({ avrechim, selKey, prevKey, calcAvrechMonth, selYear, selMonth, getAV, setAvMonthField, supplementSettings, setSupplementSettings }){
  const [editSupp,setEditSupp] = useState(false);
  const [tempDatot,setTempDatot] = useState(String(supplementSettings.datot||1000));
  const [tempKeren,setTempKeren] = useState(String(supplementSettings.keren||1000));

  const rows = avrechim.filter(a=>a.active).map(av=>({
    av,
    c: calcAvrechMonth(av,selKey,prevKey),
    paid: getAV(selKey,av.id,"settlementPaid")==="1"
  }));

  const iOweRows    = rows.filter(({c})=>c.settlementBalance>0 && c.monthly>0);
  const theyOweRows = rows.filter(({c})=>c.settlementBalance<0 && c.monthly>0);
  const evenRows    = rows.filter(({c})=>c.settlementBalance===0 && c.monthly>0);
  const noDataRows  = rows.filter(({c})=>c.monthly===0);

  const totalIOwe   = iOweRows.reduce((s,{c})=>s+c.settlementBalance,0);
  const totalOwedMe = theyOweRows.reduce((s,{c})=>s+Math.abs(c.settlementBalance),0);

  const paidIOwe    = iOweRows.filter(({paid})=>paid).reduce((s,{c})=>s+c.settlementBalance,0);
  const paidOwedMe  = theyOweRows.filter(({paid})=>paid).reduce((s,{c})=>s+Math.abs(c.settlementBalance),0);

  // פירוט "איך הגיע הסכום" — נוכחות / דתות / קרן / מבחנים / תענית דיבור
  const Breakdown = ({c})=>{
    const parts=[];
    if(c.monthly>0) parts.push({label:"נוכחות",val:c.monthly,color:"#1e3a5f"});
    if(c.datot>0)   parts.push({label:"דתות",val:c.datot,color:"#b45309"});
    if(c.keren>0)   parts.push({label:"קרן",val:c.keren,color:"#059669"});
    if(c.exams>0)   parts.push({label:"מבחנים",val:c.exams,color:"#7c3aed"});
    if(c.taanitAmount>0) parts.push({label:"תענית דיבור",val:c.taanitAmount,color:"#0369a1"});
    if(parts.length===0) return null;
    return (
      <div className="breakdown-line" style={{display:"flex",flexWrap:"wrap",gap:"4px 10px",fontSize:11,color:"#64748b",marginTop:3}}>
        {parts.map((p,i)=>(
          <span key={i}>
            <span style={{color:p.color,fontWeight:600}}>{p.label}:</span> {fmt(p.val)} ₪
            {i<parts.length-1&&<span style={{color:"#cbd5e1"}}> · </span>}
          </span>
        ))}
      </div>
    );
  };

  const ARow = ({av,c,paid})=>{
    const bal = c.settlementBalance;
    const absBal = Math.abs(bal);
    const iOwe = bal>0;
    return (
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"9px 10px",borderRadius:9,marginBottom:5,
        background: paid?"#f0fdf4":iOwe?"#fffbeb":"#fef2f2",
        border:`1.5px solid ${paid?"#86efac":iOwe?"#fde68a":"#fecaca"}`,
        opacity:paid?0.7:1,transition:"all .2s"}}>
        <div>
          <div style={{fontWeight:700,fontSize:14}}>{av.name}</div>
          <div style={{fontSize:11,color:"#64748b",marginTop:2}}>
            מגיע לו: <b>{fmt(c.monthly)} ₪</b> &nbsp;|&nbsp;
            חיצוני: {fmt(c.externalPerAvrech)} ₪ &nbsp;|&nbsp;
            השלמה: {fmt(c.suppAmt)} ₪
          </div>
          <Breakdown c={c}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}} className="no-print">
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:800,color:iOwe?"#d97706":"#dc2626"}}>
              {iOwe?"▲":"▼"} {fmt(absBal)} ₪
            </div>
            <div style={{fontSize:10,color:"#94a3b8"}}>{iOwe?"סריקוב חייב":"אברך חייב"}</div>
          </div>
          <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",
            background:paid?"#16a34a":"#f1f5f9",border:`2px solid ${paid?"#16a34a":"#cbd5e1"}`,
            borderRadius:7,padding:"4px 10px",fontSize:12,fontWeight:600,
            color:paid?"#fff":"#64748b",transition:"all .2s",userSelect:"none"}}>
            <input type="checkbox"
              checked={paid}
              onChange={e=>setAvMonthField(selKey,av.id,"settlementPaid",e.target.checked?"1":"")}
              style={{width:15,height:15,cursor:"pointer",accentColor:"#16a34a"}}/>
            {paid?"✓ בוצע":"סמן"}
          </label>
        </div>
        <div className="print-only" style={{textAlign:"left",fontWeight:800,fontSize:15}}>
          {iOwe?"▲":"▼"} {fmt(absBal)} ₪ <span style={{fontSize:10,fontWeight:400}}>({iOwe?"סריקוב חייב":"אברך חייב"})</span>
        </div>
      </div>
    );
  };

  return (
    <div style={col}>
      <style>{`
        @media print {
          .no-print { display:none !important; }
          .print-only { display:block !important; }
          body { background:#fff !important; }
        }
        .print-only { display:none; }
        .print-header { display:none; }
        @media print {
          .print-header { display:block !important; text-align:center; margin-bottom:16px; }
        }
      `}</style>

      <div className="print-header">
        <div style={{fontWeight:800,fontSize:20}}>היסטוריית העברות — סריקוב</div>
        <div style={{fontSize:13,color:"#64748b"}}>{mkMonthLabel(selYear,selMonth)}</div>
      </div>

      <div className="no-print" style={{display:"flex",justifyContent:"flex-end"}}>
        <button style={{...smallBtn,fontWeight:700}} onClick={()=>window.print()}>🖨️ הדפס היסטוריית העברות</button>
      </div>

      {/* כרטיס הגדרות השלמה */}
      <div style={{...card,borderRight:"4px solid #7c3aed"}} className="no-print">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:editSupp?10:0}}>
          <div style={{fontWeight:700,fontSize:14,color:"#7c3aed"}}>⚙️ הגדרות השלמה חודשית (₪ לאברך)</div>
          <button style={{...smallBtn,color:"#7c3aed",borderColor:"#c4b5fd"}}
            onClick={()=>{ setTempDatot(String(supplementSettings.datot||1000)); setTempKeren(String(supplementSettings.keren||1000)); setEditSupp(!editSupp); }}>
            {editSupp?"סגור":"✏️ ערוך"}
          </button>
        </div>
        {!editSupp && (
          <div style={{display:"flex",gap:16,marginTop:6}}>
            <div style={{fontSize:13}}><span style={{color:"#b45309",fontWeight:700}}>דתות:</span> <b>{fmt(supplementSettings.datot||0)} ₪</b> לאברך</div>
            <div style={{fontSize:13}}><span style={{color:"#059669",fontWeight:700}}>קרן:</span> <b>{fmt(supplementSettings.keren||0)} ₪</b> לאברך</div>
          </div>
        )}
        {editSupp && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              <label style={{fontSize:12,color:"#b45309",fontWeight:700,display:"block",marginBottom:4}}>השלמה — דתות (₪ לאברך)</label>
              <input type="number" style={inp} value={tempDatot} onChange={e=>setTempDatot(e.target.value)}/>
            </div>
            <div>
              <label style={{fontSize:12,color:"#059669",fontWeight:700,display:"block",marginBottom:4}}>השלמה — קרן (₪ לאברך)</label>
              <input type="number" style={inp} value={tempKeren} onChange={e=>setTempKeren(e.target.value)}/>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <button style={{...primaryBtn,background:"#7c3aed"}} onClick={()=>{
                setSupplementSettings({datot:Number(tempDatot)||0,keren:Number(tempKeren)||0});
                setEditSupp(false);
              }}>💾 שמור הגדרות</button>
            </div>
          </div>
        )}
      </div>

      {/* סיכום כולל */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={{background:"linear-gradient(135deg,#92400e,#d97706)",borderRadius:12,padding:"14px",color:"#fff"}}>
          <div style={{fontSize:11,opacity:.8}}>אני חייב לאברכים</div>
          <div style={{fontSize:28,fontWeight:800}}>{fmt(totalIOwe)} ₪</div>
          <div style={{fontSize:11,opacity:.7,marginTop:2}}>שולם: {fmt(paidIOwe)} ₪</div>
        </div>
        <div style={{background:"linear-gradient(135deg,#991b1b,#dc2626)",borderRadius:12,padding:"14px",color:"#fff"}}>
          <div style={{fontSize:11,opacity:.8}}>אברכים חייבים לי</div>
          <div style={{fontSize:28,fontWeight:800}}>{fmt(totalOwedMe)} ₪</div>
          <div style={{fontSize:11,opacity:.7,marginTop:2}}>הוחזר: {fmt(paidOwedMe)} ₪</div>
        </div>
      </div>

      {iOweRows.length>0&&(
        <div style={card}>
          <div style={{fontWeight:700,fontSize:14,color:"#d97706",marginBottom:8}}>
            🟡 אני חייב לאברך ({iOweRows.length})
          </div>
          {iOweRows.map(({av,c,paid})=><ARow key={av.id} av={av} c={c} paid={paid}/>)}
        </div>
      )}

      {theyOweRows.length>0&&(
        <div style={card}>
          <div style={{fontWeight:700,fontSize:14,color:"#dc2626",marginBottom:8}}>
            🔴 אברך חייב לי ({theyOweRows.length})
          </div>
          {theyOweRows.map(({av,c,paid})=><ARow key={av.id} av={av} c={c} paid={paid}/>)}
        </div>
      )}

      {evenRows.length>0&&(
        <div style={card}>
          <div style={{fontWeight:700,fontSize:13,color:"#16a34a",marginBottom:6}}>✅ מאוזן ({evenRows.length})</div>
          {evenRows.map(({av,c})=>(
            <div key={av.id} style={{padding:"6px 8px",borderRadius:7,background:"#f0fdf4",marginBottom:4}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontWeight:600,fontSize:13}}>{av.name}</span>
                <span style={{fontSize:12,color:"#16a34a",fontWeight:700}}>✓ מאוזן — {fmt(c.monthly)} ₪</span>
              </div>
              <Breakdown c={c}/>
            </div>
          ))}
        </div>
      )}

      {noDataRows.length>0&&(
        <div style={{...card,opacity:0.6}} className="no-print">
          <div style={{fontWeight:600,fontSize:12,color:"#94a3b8",marginBottom:5}}>⬜ ללא נתוני מגיע ({noDataRows.length})</div>
          <div style={{fontSize:12,color:"#94a3b8"}}>{noDataRows.map(({av})=>av.name).join(" | ")}</div>
        </div>
      )}
    </div>
  );
}
