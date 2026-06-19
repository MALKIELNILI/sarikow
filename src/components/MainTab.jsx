import { useState } from "react";
import { fmt, fmtSigned } from "../helpers.js";
import { mkMonthKey, mkMonthLabel } from "../constants.js";
import { col, card, inp, iinp, tbl, th, td, empty, divider, addBtn, primaryBtn, greenBtn, grayBtn, smallBtn, delBtn } from "../styles.js";
import { Chip, BalanceConfirm, IField, MR, FG, Modal, CBox } from "./SmallComponents.jsx";

const now = new Date();

export default function MainTab({ selKey, selYear, selMonth, baseBalance, setBaseBalance, liveBalance, curTotals, allMonths, getMD, setMonthField, allDonorNames, donorHistory, avrechim }){
  const [editBase,setEditBase]=useState(false);
  const [tempBase,setTempBase]=useState(baseBalance.amount);
  const [showDonor,setShowDonor]=useState(false);
  const [newDonor,setNewDonor]=useState({name:"",amount:""});
  const [showAdj,setShowAdj]=useState(false);
  const donors=(allMonths[selKey]?.donors)||[];

  const datotCount = avrechim.filter(a=>a.active && (a.incomeGroup||(a.track==="keren"?"keren":"datot"))==="datot").length;
  const kerenCount = avrechim.filter(a=>a.active && (a.incomeGroup||(a.track==="keren"?"keren":"datot"))==="keren").length;
  const perDatot = datotCount>0 ? Math.round(Number(getMD(selKey,"datot"))/datotCount) : 0;
  const perKeren = kerenCount>0 ? Math.round(Number(getMD(selKey,"keren"))/kerenCount) : 0;

  return (
    <div style={col}>
      {/* BALANCE */}
      <div style={{background:"linear-gradient(135deg,#0f2044,#1d4ed8)",borderRadius:12,padding:"14px 16px",color:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
        <div style={{fontSize:13,opacity:.75,marginBottom:4}}>יתרה חיה מצטברת</div>
        <div style={{fontSize:36,fontWeight:800}}>{fmt(liveBalance)} ₪</div>
        <div style={{display:"flex",gap:7,marginTop:10,flexWrap:"wrap"}}>
          <Chip label="בסיס"          val={fmt(baseBalance.amount)+" ₪"} />
          <Chip label="הכנסות חודש"   val={"+"+fmt(curTotals.income)+" ₪"} pos />
          <Chip label="קיזוז עיגול"   val={"−"+fmt(curTotals.totalRounding)+" ₪"} neg />
          <Chip label="נשלח לאברכים"  val={"−"+fmt(curTotals.sent)+" ₪"} neg />
        </div>
        <div style={{marginTop:8,fontSize:12,opacity:.7}}>
          בסיס נכון לתאריך: {baseBalance.date}
          <button style={{background:"none",border:"none",color:"rgba(255,255,255,.7)",cursor:"pointer",fontSize:12,marginRight:10,textDecoration:"underline"}}
            onClick={()=>{setTempBase(baseBalance.amount);setEditBase(true);}}>✏️ עדכן בסיס</button>
        </div>
      </div>

      {editBase && (
        <div style={card}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:8}}>עדכון יתרת בסיס</div>
          <div style={{display:"flex",gap:8}}>
            <input style={{...inp,flex:1}} type="number" value={tempBase} onChange={e=>setTempBase(e.target.value)} autoFocus/>
            <button style={greenBtn} onClick={()=>{setBaseBalance({amount:Number(tempBase)||0,date:new Date().toLocaleDateString("he-IL"),monthKey:mkMonthKey(now.getFullYear(),now.getMonth())});setEditBase(false);}}>שמור</button>
            <button style={grayBtn}  onClick={()=>setEditBase(false)}>ביטול</button>
          </div>
        </div>
      )}

      {/* DONORS */}
      <datalist id="donor-names-list">
        {allDonorNames.map((n,i)=><option key={i} value={n}/>)}
      </datalist>
      <div style={card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:6}}>
          <div>
            <div style={{fontWeight:700,fontSize:14}}>💝 תורמים — {mkMonthLabel(selYear,selMonth)}</div>
            <div style={{marginTop:5,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              <span style={{fontSize:11,color:"#64748b"}}>📅 תאריך סיכום:</span>
              <input type="date"
                value={getMD(selKey,"summaryDate","")}
                onChange={e=>setMonthField(selKey,"summaryDate",e.target.value)}
                style={{fontSize:11,border:"1.5px solid #cbd5e1",borderRadius:6,padding:"3px 7px",color:"#1e293b",background:"#f8fafc",direction:"ltr"}}
              />
              {!getMD(selKey,"summaryDate") && (
                <button style={{...smallBtn,fontSize:10,background:"#f0f9ff",color:"#0369a1",border:"1px solid #bae6fd"}}
                  onClick={()=>setMonthField(selKey,"summaryDate",new Date().toISOString().split("T")[0])}>
                  היום
                </button>
              )}
            </div>
          </div>
          <button style={addBtn} onClick={()=>setShowDonor(true)}>+ הוסף</button>
        </div>
        {donors.length===0
          ? <div style={empty}>לחץ ״+ הוסף״ להוסיף תורם</div>
          : <table style={tbl}>
              <thead><tr><th style={th}>שם</th><th style={th}>סכום (₪)</th><th style={th}></th></tr></thead>
              <tbody>
                {donors.map((d,i)=>(
                  <tr key={i} style={{borderBottom:"1px solid #f1f5f9"}}>
                    <td style={td}><input style={iinp} list="donor-names-list" value={d.name} onChange={e=>{
                      const name=e.target.value;
                      setMonthField(selKey,"donors",donors.map((x,j)=>{
                        if(j!==i) return x;
                        const upd={...x,name};
                        if(donorHistory[name]!==undefined) upd.amount=donorHistory[name];
                        return upd;
                      }));
                    }}/></td>
                    <td style={td}><input style={{...iinp,textAlign:"left"}} type="number" value={d.amount} onChange={e=>setMonthField(selKey,"donors",donors.map((x,j)=>j===i?{...x,amount:e.target.value}:x))}/></td>
                    <td style={td}><button style={delBtn} onClick={()=>setMonthField(selKey,"donors",donors.filter((_,j)=>j!==i))}>✕</button></td>
                  </tr>
                ))}
                <tr style={{background:"#f0f9ff"}}><td style={{...td,fontWeight:700}}>סה״כ</td><td style={{...td,fontWeight:700}}>{fmt(curTotals.donors)} ₪</td><td></td></tr>
              </tbody>
            </table>
        }
      </div>

      {/* INCOME */}
      <div style={card}>
        <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>📥 הכנסות נוספות (מתווספות לקופה)</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div>
            <IField label="🏛️ הכנסת דתות (₪)" value={getMD(selKey,"datot")}  onChange={v=>setMonthField(selKey,"datot",Number(v)||0)} />
            {datotCount>0 && (
              <div style={{display:"flex",alignItems:"center",gap:5,marginTop:4}}>
                <span style={{fontSize:11,color:"#b45309",whiteSpace:"nowrap"}}>לאברך אחד ({datotCount}):</span>
                <input style={{...iinp,textAlign:"left"}} type="number" value={perDatot||""} placeholder="0"
                  onChange={e=>setMonthField(selKey,"datot",Math.round((Number(e.target.value)||0)*datotCount))} />
              </div>
            )}
            <BalanceConfirm draft={getMD(selKey,"datot")} confirmed={getMD(selKey,"datotConfirmed")} prevConfirmed={getMD(selKey,"datotConfirmedPrev",null)}
              onConfirm={()=>{
                setMonthField(selKey,"datotConfirmedPrev",Number(getMD(selKey,"datotConfirmed"))||0);
                setMonthField(selKey,"datotConfirmed",Number(getMD(selKey,"datot"))||0);
              }}
              onUndo={()=>{
                setMonthField(selKey,"datotConfirmed",Number(getMD(selKey,"datotConfirmedPrev"))||0);
                setMonthField(selKey,"datotConfirmedPrev",null);
              }} />
          </div>
          <div>
            <IField label="📚 קרן התורה (₪)"   value={getMD(selKey,"keren")}  onChange={v=>setMonthField(selKey,"keren",Number(v)||0)} />
            {kerenCount>0 && (
              <div style={{display:"flex",alignItems:"center",gap:5,marginTop:4}}>
                <span style={{fontSize:11,color:"#059669",whiteSpace:"nowrap"}}>לאברך אחד ({kerenCount}):</span>
                <input style={{...iinp,textAlign:"left"}} type="number" value={perKeren||""} placeholder="0"
                  onChange={e=>setMonthField(selKey,"keren",Math.round((Number(e.target.value)||0)*kerenCount))} />
              </div>
            )}
            <BalanceConfirm draft={getMD(selKey,"keren")} confirmed={getMD(selKey,"kerenConfirmed")} prevConfirmed={getMD(selKey,"kerenConfirmedPrev",null)}
              onConfirm={()=>{
                setMonthField(selKey,"kerenConfirmedPrev",Number(getMD(selKey,"kerenConfirmed"))||0);
                setMonthField(selKey,"kerenConfirmed",Number(getMD(selKey,"keren"))||0);
              }}
              onUndo={()=>{
                setMonthField(selKey,"kerenConfirmed",Number(getMD(selKey,"kerenConfirmedPrev"))||0);
                setMonthField(selKey,"kerenConfirmedPrev",null);
              }} />
          </div>
        </div>
      </div>

      {/* SENT */}
      <div style={card}>
        <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>📤 נשלח לאברכים (מתקזז מהקופה)</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <IField label="👨‍🎓 מספר × 2,000" value={getMD(selKey,"sent2000")}  onChange={v=>setMonthField(selKey,"sent2000",Number(v)||0)} />
          <IField label="👨‍🎓 מספר × 1,000" value={getMD(selKey,"sent1000")}  onChange={v=>setMonthField(selKey,"sent1000",Number(v)||0)} />
          <IField label="📚 מספר × 1,000"      value={getMD(selKey,"sentKeren")} onChange={v=>setMonthField(selKey,"sentKeren",Number(v)||0)} />
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:8}}>
          <CBox label="שולם ×2000" val={fmt(getMD(selKey,"sent2000")*2000)+" ₪"} />
          <CBox label="שולם ×1000" val={fmt(getMD(selKey,"sent1000")*1000)+" ₪"} />
          <CBox label="שולם קרן"   val={fmt(getMD(selKey,"sentKeren")*1000)+" ₪"} />
        </div>
      </div>

      {/* ADJUSTMENT */}
      <div style={{...card, border:"1.5px solid #f59e0b", background:"#fffbeb"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontWeight:700,fontSize:14}}>⚖️ התאמה ידנית לקופה</span>
          <button style={{...smallBtn, background: showAdj?"#f59e0b":"#fef3c7", color: showAdj?"#fff":"#92400e", border:"1px solid #f59e0b"}}
            onClick={()=>setShowAdj(p=>!p)}>
            {showAdj ? "סגור ✕" : "± פתח"}
          </button>
        </div>
        {getMD(selKey,"adjustment")!==0 && !showAdj && (
          <div style={{marginTop:6,fontSize:13,color:getMD(selKey,"adjustment")>0?"#16a34a":"#dc2626",fontWeight:700}}>
            {getMD(selKey,"adjustment")>0?"הוספה":"גריעה"}: {fmtSigned(getMD(selKey,"adjustment"))} ₪
            {getMD(selKey,"adjustmentNote") && <span style={{color:"#78716c",fontWeight:400,marginRight:6}}>— {getMD(selKey,"adjustmentNote")}</span>}
          </div>
        )}
        {showAdj && (
          <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button style={{...smallBtn, background: getMD(selKey,"adjustment")>=0?"#16a34a":"#e2e8f0", color: getMD(selKey,"adjustment")>=0?"#fff":"#64748b", minWidth:36}}
                onClick={()=>{ const cur=getMD(selKey,"adjustment"); if(cur<0) setMonthField(selKey,"adjustment",-cur); }}>+</button>
              <input style={{...inp,flex:1,textAlign:"center"}} type="number"
                value={Math.abs(getMD(selKey,"adjustment")||0)}
                onChange={e=>{ const sign=getMD(selKey,"adjustment")<0?-1:1; setMonthField(selKey,"adjustment",sign*(Number(e.target.value)||0)); }}
                placeholder="סכום..." />
              <button style={{...smallBtn, background: getMD(selKey,"adjustment")<0?"#dc2626":"#e2e8f0", color: getMD(selKey,"adjustment")<0?"#fff":"#64748b", minWidth:36}}
                onClick={()=>{ const cur=getMD(selKey,"adjustment"); if(cur>0) setMonthField(selKey,"adjustment",-cur); }}>−</button>
            </div>
            <input style={inp} placeholder="הערה (אופציונלי)..."
              value={getMD(selKey,"adjustmentNote")||""}
              onChange={e=>setMonthField(selKey,"adjustmentNote",e.target.value)} />
            <div style={{fontSize:12,color:"#78716c",textAlign:"center"}}>
              {getMD(selKey,"adjustment")>0 ? `מוסיף ${fmt(getMD(selKey,"adjustment"))} ₪ לקופה` :
               getMD(selKey,"adjustment")<0 ? `גורע ${fmt(Math.abs(getMD(selKey,"adjustment")))} ₪ מהקופה` : "אין התאמה"}
            </div>
          </div>
        )}
      </div>

      {/* MINI SUMMARY */}
      <div style={{...card,background:"#f0fdf4",border:"1.5px solid #22c55e"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:6}}>
          <span style={{fontWeight:700,fontSize:14}}>📊 סיכום {mkMonthLabel(selYear,selMonth)}</span>
          {getMD(selKey,"summaryDate") && (
            <span style={{fontSize:12,fontWeight:700,color:"#166534",background:"#bbf7d0",borderRadius:20,padding:"3px 10px"}}>
              📅 {getMD(selKey,"summaryDate").split("-").reverse().join("/")}
            </span>
          )}
        </div>
        <MR l="תורמים"         v={curTotals.donors} />
        <MR l="דתות"           v={curTotals.datot} />
        <MR l="קרן"            v={curTotals.keren} />
        <MR l="נשלח לאברכים"  v={-curTotals.sent} neg />
        {curTotals.adjustment!==0 && <MR l={curTotals.adjustment>0?"התאמה ➕":"התאמה ➖"} v={curTotals.adjustment} color={curTotals.adjustment>0?"#16a34a":"#dc2626"} />}
        <div style={divider}/>
        <MR l="נטו חודש זה" v={curTotals.net} bold color={curTotals.net>=0?"#16a34a":"#dc2626"} />
        <div style={{height:1,background:"rgba(34,197,94,0.4)",margin:"8px 0"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0"}}>
          <span style={{fontWeight:800,fontSize:15,color:"#14532d"}}>💰 יתרה כוללת בקופה</span>
          <span style={{fontWeight:800,fontSize:22,color:"#15803d"}}>{fmt(liveBalance)} ₪</span>
        </div>
        {getMD(selKey,"summaryDate") && (
          <div style={{fontSize:11,color:"#166534",textAlign:"center",marginTop:3,background:"#bbf7d0",borderRadius:8,padding:"3px 8px"}}>
            📅 תאריך פגישה עם סריקוב: {getMD(selKey,"summaryDate").split("-").reverse().join("/")}
          </div>
        )}
      </div>

      {showDonor && (
        <Modal title="הוספת תורם" onClose={()=>setShowDonor(false)}>
          <FG label="שם התורם"><input style={inp} list="donor-names-list" value={newDonor.name} onChange={e=>{
            const name=e.target.value;
            setNewDonor(p=>({...p, name, amount: donorHistory[name]!==undefined ? donorHistory[name] : p.amount}));
          }} placeholder="שם..."/></FG>
          <FG label="סכום (₪)"><input style={inp} type="number" value={newDonor.amount} onChange={e=>setNewDonor(p=>({...p,amount:e.target.value}))} placeholder="0"/></FG>
          <button style={primaryBtn} onClick={()=>{
            if(!newDonor.name||!newDonor.amount) return;
            setMonthField(selKey,"donors",[...donors,{name:newDonor.name,amount:Number(newDonor.amount)}]);
            setNewDonor({name:"",amount:""});
            setShowDonor(false);
          }}>הוסף</button>
        </Modal>
      )}
    </div>
  );
}
