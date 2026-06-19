import { useState } from "react";
import { fmt, fmtSigned } from "../helpers.js";
import { mkMonthLabel, trackColor } from "../constants.js";
import { col, card, tbl, th, td, divider } from "../styles.js";
import { MR } from "./SmallComponents.jsx";

export default function SummaryTab({ avrechim, allMonthKeys, calcMonthTotals, calcAvrechMonth, getPrevMonthKey, baseBalance, liveBalance, selKey, allMonths }){
  const [openMonth,setOpenMonth]=useState(selKey);
  const baseMonthKey = baseBalance.monthKey || "0000-00";
  const calcCumBalance = (upToKey) => {
    let sum = Number(baseBalance.amount||0);
    allMonthKeys.filter(k=>k>=baseMonthKey&&k<=upToKey).forEach(k=>{ sum+=calcMonthTotals(k).net; });
    return sum;
  };

  return (
    <div style={col}>
      <div style={{background:"linear-gradient(135deg,#0f2044,#1d4ed8)",borderRadius:12,padding:"14px 16px",color:"#fff"}}>
        <div style={{fontSize:13,opacity:.75}}>יתרה חיה מצטברת</div>
        <div style={{fontSize:32,fontWeight:800}}>{fmt(liveBalance)} ₪</div>
        <div style={{fontSize:12,opacity:.7,marginTop:4}}>בסיס {fmt(baseBalance.amount)} ₪ (נכון ל-{baseBalance.date}) + סיכום כל החודשים</div>
      </div>

      {allMonthKeys.length===0 && <div style={{...card,...{color:"#94a3b8",textAlign:"center"}}}>אין נתונים עדיין</div>}

      {[...allMonthKeys].reverse().map(key=>{
        const t=calcMonthTotals(key);
        const prevK=getPrevMonthKey(key);
        const isOpen=openMonth===key;
        const [y,m]=key.split("-");
        const label=mkMonthLabel(Number(y),Number(m)-1);
        return (
          <div key={key} style={card}>
            <button onClick={()=>setOpenMonth(isOpen?null:key)} style={{background:"none",border:"none",cursor:"pointer",width:"100%",textAlign:"right",display:"flex",justifyContent:"space-between",alignItems:"center",padding:0}}>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontWeight:700,fontSize:14}}>{label}</span>
                <span style={{fontSize:12,color:t.net>=0?"#16a34a":"#dc2626",fontWeight:600}}>{fmtSigned(t.net)} ₪ נטו</span>
              </div>
              <span style={{color:"#94a3b8"}}>{isOpen?"▲":"▼"}</span>
            </button>

            {isOpen && (
              <div style={{marginTop:12}}>
                <MR l="תורמים"       v={t.donors} />
                <MR l="דתות"         v={t.datot} />
                <MR l="קרן התורה"    v={t.keren} />
                <MR l="סה״כ הכנסות" v={t.income} bold />
                <div style={divider}/>
                <MR l="קיזוז עיגול"  v={-t.totalRounding} neg />
                <MR l="נשלח"         v={-t.sent} neg />
                <div style={divider}/>
                <MR l="נטו חודש" v={t.net} bold color={t.net>=0?"#16a34a":"#dc2626"} />
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#eff6ff",borderRadius:8,padding:"8px 12px",marginTop:8,border:"1.5px solid #bfdbfe"}}>
                  <span style={{fontWeight:700,fontSize:13,color:"#1d4ed8"}}>💰 יתרה כוללת עד חודש זה</span>
                  <span style={{fontWeight:800,fontSize:18,color:"#1d4ed8"}}>{fmt(calcCumBalance(key))} ₪</span>
                </div>
                {allMonths[key]?.summaryDate && (
                  <div style={{fontSize:11,color:"#166534",textAlign:"center",marginTop:4,background:"#bbf7d0",borderRadius:8,padding:"3px 8px"}}>
                    📅 תאריך פגישה: {allMonths[key].summaryDate.split("-").reverse().join("/")}
                  </div>
                )}

                <div style={{marginTop:12,fontSize:13,fontWeight:700,color:"#475569",marginBottom:6}}>פירוט אברכים:</div>
                <table style={tbl}>
                  <thead>
                    <tr>
                      <th style={th}>שם</th>
                      <th style={th}>מגיע</th>
                      <th style={th}>עיגול</th>
                      <th style={th}>בחינות</th>
                      <th style={th}>פער קודם</th>
                      <th style={th}>🏦 לבנק</th>
                      <th style={th}>הוכנס</th>
                      <th style={th}>פער</th>
                    </tr>
                  </thead>
                  <tbody>
                    {avrechim.filter(a=>a.active).map(av=>{
                      const c=calcAvrechMonth(av,key,prevK);
                      if(c.monthly===0) return null;
                      return (
                        <tr key={av.id} style={{borderBottom:"1px solid #f1f5f9",borderRight:`3px solid ${trackColor[av.track]}`}}>
                          <td style={td}>{av.name}</td>
                          <td style={td}>{fmt(c.monthly)}</td>
                          <td style={td}>{c.rounding>0?fmt(c.rounding):"—"}</td>
                          <td style={td}>{c.exams>0?fmt(c.exams):"—"}</td>
                          <td style={{...td,color:c.prevBankGap>0?"#dc2626":c.prevBankGap<0?"#2563eb":"#94a3b8"}}>{c.prevBankGap!==0?fmtSigned(c.prevBankGap):"—"}</td>
                          <td style={{...td,fontWeight:700,color:c.effectiveBank>=0?"#16a34a":"#dc2626"}}>{fmt(c.effectiveBank)}</td>
                          <td style={td}>{c.actualBank!==null?fmt(c.actualBank):"—"}</td>
                          <td style={{...td,color:c.bankGap>0?"#dc2626":c.bankGap<0?"#2563eb":"#94a3b8"}}>{c.actualBank!==null?(c.bankGap!==0?fmtSigned(c.bankGap):"✓"):"—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
