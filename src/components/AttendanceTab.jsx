import { useState } from "react";
import { fmt } from "../helpers.js";
import {
  getDayType, getMonthWeeks, toHebrewDay, toHebrewMonth, toFullHebDate,
  HEB_MONTHS, HEB_LETTERS, HEB_YEARS, _curHebYear, hebToGreg, hebMonthDays, hebYearLabel
} from "../helpers.js";
import { mkMonthLabel, HOLIDAYS_DB } from "../constants.js";
import { col, card, inp, tbl, th, td, primaryBtn, smallBtn, delBtn } from "../styles.js";
import { Modal } from "./SmallComponents.jsx";

export default function AttendanceTab({ avrechim, selKey, selYear, selMonth, attendance, setAttendanceDay, fillMonthBatch, customVacations, setCustomVacation, removeCustomVacation, beinHazmanims, addBeinHazmanim, removeBeinHazmanim, updateBeinHazmanim, hiddenHols, toggleHolidayHidden }) {
  const [settingsModal,setSettingsModal]= useState(false);
  const [shareModal,  setShareModal]   = useState(false);
  const [viewMode,    setViewMode]     = useState("grid");
  const [hebYear,     setHebYear]      = useState(_curHebYear);
  const [hebMonth,    setHebMonth]     = useState("ניסן");
  const [hebDay,      setHebDay]       = useState(1);
  const [newVacLabel, setNewVacLabel]  = useState("");
  const [vacEveryYear,setVacEveryYear] = useState(false);
  const [bhEveryYear, setBhEveryYear]  = useState(false);
  const [newBh,       setNewBh]        = useState({yearFrom:_curHebYear,monthFrom:"תשרי",dayFrom:1,yearTo:_curHebYear,monthTo:"תשרי",dayTo:29,label:""});
  const [editBhIdx,   setEditBhIdx]    = useState(null);
  const [editBhData,  setEditBhData]   = useState({from:"",to:"",label:""});
  const [tooltip,     setTooltip]      = useState(null);

  const activeAvrechim = avrechim.filter(a=>a.active);
  const weeks = getMonthWeeks(selYear, selMonth);

  const getAtt = (avId,dateStr) => attendance[selKey]?.[String(avId)]?.[dateStr];

  const isPresent = (avId,dateStr,dt) => {
    const val=getAtt(avId,dateStr);
    if(val!==undefined) return val==="1";
    return dt.type==="learning";
  };

  const toggleAtt = (avId,dateStr,dt) => {
    setAttendanceDay(selKey,avId,dateStr,isPresent(avId,dateStr,dt)?"0":"1");
  };

  const calcSummary = (av) => {
    let present=0,total=0;
    weeks.forEach(week=>week.forEach(day=>{
      if(!day.inMonth) return;
      const dt=getDayType(day.dateStr,customVacations,beinHazmanims,hiddenHols);
      if(dt.type!=="learning") return;
      total++;
      if(isPresent(av.id,day.dateStr,dt)) present++;
    }));
    return { present, total, pct:total>0?Math.round(present/total*100):0 };
  };

  const generateMessage = () => {
    const label=mkMonthLabel(selYear,selMonth);
    const totalDays=weeks.reduce((s,w)=>s+w.filter(d=>d.inMonth&&getDayType(d.dateStr,customVacations,beinHazmanims,hiddenHols).type==="learning").length,0);
    let lines=[`📋 נוכחות אברכים — ${label}`,`סה״כ ימי לימוד: ${totalDays}\n`];
    activeAvrechim.forEach(av=>{
      const {present,total,pct}=calcSummary(av);
      lines.push(`${av.name}: ${present}/${total} (${pct}%)`);
    });
    return lines.join("\n");
  };

  const monthVacDates=Object.entries(customVacations||{}).filter(([d])=>d.startsWith(selKey));
  const DAY_NAMES_HE=["א׳","ב׳","ג׳","ד׳","ה׳"];
  const offBg={ bein_hazmanim:"#f1f5f9", holiday:"#fefce8", vacation:"#fff0f0", friday:"#f8fafc", shabbat:"#f8fafc" };

  return (
    <div style={col}>
      {tooltip&&(
        <div style={{position:"fixed",left:tooltip.x,top:tooltip.y-6,transform:"translate(-50%,-100%)",
          background:"rgba(30,41,59,0.95)",color:"#fff",borderRadius:7,padding:"4px 10px",
          fontSize:12,fontWeight:600,pointerEvents:"none",zIndex:2000,whiteSpace:"nowrap",
          boxShadow:"0 2px 8px rgba(0,0,0,0.25)"}}>
          {tooltip.text}
        </div>
      )}

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#064e3b,#059669)",borderRadius:12,padding:"14px 16px",color:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
        <div style={{fontSize:13,opacity:.8,marginBottom:6}}>📋 נוכחות — {mkMonthLabel(selYear,selMonth)}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <button style={{padding:"5px 12px",borderRadius:8,background:"#fff",color:"#064e3b",border:"none",cursor:"pointer",fontWeight:700,fontSize:12}}
            onClick={()=>fillMonthBatch(selKey,activeAvrechim,weeks,customVacations)}>✅ מלא חודש</button>
          <button style={{padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,.18)",color:"#fff",border:"1px solid rgba(255,255,255,.35)",cursor:"pointer",fontWeight:600,fontSize:12}}
            onClick={()=>setSettingsModal(true)}>⚙️ הגדרות חופשות</button>
          <button style={{padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,.18)",color:"#fff",border:"1px solid rgba(255,255,255,.35)",cursor:"pointer",fontWeight:600,fontSize:12}}
            onClick={()=>setShareModal(true)}>📤 שלח לסריקוב</button>
          <div style={{marginRight:"auto",display:"flex",gap:3}}>
            {["grid","summary"].map(m=>(
              <button key={m} onClick={()=>setViewMode(m)}
                style={{padding:"3px 9px",borderRadius:6,background:viewMode===m?"#fff":"rgba(255,255,255,.18)",color:viewMode===m?"#064e3b":"#fff",border:"none",cursor:"pointer",fontSize:11,fontWeight:700}}>
                {m==="grid"?"גריד":"סיכום"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {[["#22c55e","נוכח","#f0fdf4"],["#ef4444","נעדר","#fef2f2"],["#f59e0b","חג","#fefce8"],["#94a3b8","בין הזמנים","#f1f5f9"],["#fca5a5","חופשה","#fff0f0"]].map(([c,l,bg])=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:3,background:bg,borderRadius:20,padding:"2px 8px",border:`1px solid ${c}`,fontSize:10,color:"#475569"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:c}}/>{l}
          </div>
        ))}
      </div>

      {/* Custom vacations */}
      {monthVacDates.length>0&&(
        <div style={{...card,background:"#fff0f0",border:"1.5px solid #fca5a5",padding:"8px 12px"}}>
          <div style={{fontWeight:700,fontSize:12,color:"#dc2626",marginBottom:4}}>🏖️ חופשות יישוב — {mkMonthLabel(selYear,selMonth)}</div>
          {monthVacDates.map(([d,label])=>(
            <div key={d} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,padding:"2px 0"}}>
              <span style={{color:"#475569"}}>{d.slice(8)}/{selMonth+1} — {label}</span>
              <button style={delBtn} onClick={()=>removeCustomVacation(d)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode==="grid" && weeks.map((week,wi)=>{
        const dayTypes=week.map(d=>getDayType(d.dateStr,customVacations,beinHazmanims,hiddenHols));
        const first=week.find(d=>d.inMonth);
        const last=[...week].reverse().find(d=>d.inMonth);
        if(!first) return null;
        return (
          <div key={wi} style={{...card,padding:"8px 10px",overflowX:"auto"}}>
            <div style={{fontWeight:700,fontSize:11,color:"#64748b",marginBottom:5,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              <span>שבוע {wi+1} &nbsp;•&nbsp; {first.dayNum}–{last.dayNum}/{selMonth+1}</span>
              <span style={{fontSize:10,color:"#7c3aed",background:"#f5f3ff",borderRadius:10,padding:"1px 7px",fontWeight:600}}>
                {toHebrewMonth(first.dateStr)}
              </span>
            </div>
            {/* Day headers */}
            <div style={{display:"grid",gridTemplateColumns:"130px repeat(5,1fr)",gap:2,marginBottom:3}}>
              <div/>
              {week.map((day,di)=>{
                const dt=dayTypes[di];
                const isOff=dt.type!=="learning";
                return (
                  <div key={di} style={{textAlign:"center",borderRadius:6,padding:"3px 1px",fontSize:10,
                    background:isOff?(offBg[dt.type]||"#f1f5f9"):"#f0fdf4",
                    border:`1px solid ${isOff?"#e2e8f0":"#86efac"}`,
                    color:day.inMonth?"#374151":"#d1d5db"}}>
                    <div style={{fontWeight:700}}>{DAY_NAMES_HE[di]}</div>
                    <div style={{fontSize:9,color:"#64748b"}}>{day.dayNum}</div>
                    {day.inMonth && <div style={{fontSize:8,color:"#7c3aed",lineHeight:1.2}}>{toHebrewDay(day.dateStr)}</div>}
                    {isOff&&dt.label&&<div style={{fontSize:8,color:"#94a3b8",lineHeight:1.1,overflow:"hidden",maxHeight:13}}>{dt.label.split(" ")[0]}</div>}
                  </div>
                );
              })}
            </div>
            {/* Avrech rows */}
            {activeAvrechim.map(av=>(
              <div key={av.id} style={{display:"grid",gridTemplateColumns:"130px repeat(5,1fr)",gap:2,marginBottom:2,alignItems:"center"}}>
                <div style={{fontSize:11,fontWeight:600,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={av.name}>
                  {av.name}
                </div>
                {week.map((day,di)=>{
                  const dt=dayTypes[di];
                  if(!day.inMonth) return <div key={di} style={{height:22}}/>;
                  if(dt.type!=="learning") return (
                    <div key={di}
                      onMouseEnter={e=>{ const r=e.currentTarget.getBoundingClientRect(); setTooltip({text:toFullHebDate(day.dateStr),x:r.left+r.width/2,y:r.top}); }}
                      onMouseLeave={()=>setTooltip(null)}
                      style={{height:22,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",background:offBg[dt.type]||"#f1f5f9",cursor:"default"}}>
                      <span style={{fontSize:11,color:"#94a3b8"}}>—</span>
                    </div>
                  );
                  const pres=isPresent(av.id,day.dateStr,dt);
                  const manual=getAtt(av.id,day.dateStr)!==undefined;
                  return (
                    <button key={di} onClick={()=>toggleAtt(av.id,day.dateStr,dt)}
                      onMouseEnter={e=>{ const r=e.currentTarget.getBoundingClientRect(); setTooltip({text:toFullHebDate(day.dateStr),x:r.left+r.width/2,y:r.top}); }}
                      onMouseLeave={()=>setTooltip(null)}
                      style={{height:22,borderRadius:5,border:`1.5px solid ${pres?"#16a34a":"#dc2626"}`,cursor:"pointer",
                        background:pres?"#22c55e":"#ef4444",fontSize:11,color:"#fff",fontWeight:800,
                        boxShadow:manual?"0 0 0 2px rgba(0,0,0,0.18)":"none",transition:"all .12s"}}>
                      {pres?"✓":"✗"}
                    </button>
                  );
                })}
              </div>
            ))}
            {/* Daily totals */}
            <div style={{display:"grid",gridTemplateColumns:"130px repeat(5,1fr)",gap:2,marginTop:4,borderTop:"1px solid #e2e8f0",paddingTop:3}}>
              <div style={{fontSize:10,color:"#94a3b8",alignSelf:"center"}}>נוכחים</div>
              {week.map((day,di)=>{
                const dt=dayTypes[di];
                if(!day.inMonth||dt.type!=="learning") return <div key={di}/>;
                const cnt=activeAvrechim.filter(av=>isPresent(av.id,day.dateStr,dt)).length;
                const tot=activeAvrechim.length;
                return <div key={di} style={{textAlign:"center",fontSize:10,fontWeight:700,color:cnt===tot?"#16a34a":cnt===0?"#dc2626":"#d97706"}}>{cnt}/{tot}</div>;
              })}
            </div>
          </div>
        );
      })}

      {/* SUMMARY VIEW */}
      {viewMode==="summary"&&(
        <div style={card}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:8}}>📊 סיכום נוכחות — {mkMonthLabel(selYear,selMonth)}</div>
          <table style={tbl}>
            <thead><tr>
              <th style={th}>שם</th>
              <th style={th}>נוכחות</th>
              <th style={{...th,textAlign:"center"}}>%</th>
              <th style={{...th,textAlign:"center"}}>סטטוס</th>
            </tr></thead>
            <tbody>
              {activeAvrechim.map(av=>{
                const {present,total,pct}=calcSummary(av);
                const color=pct>=80?"#16a34a":pct>=60?"#d97706":"#dc2626";
                const bg   =pct>=80?"#dcfce7":pct>=60?"#fef9c3":"#fee2e2";
                const lbl  =pct>=80?"מצוין":pct>=60?"בינוני":"חסר";
                return (
                  <tr key={av.id} style={{borderBottom:"1px solid #f1f5f9"}}>
                    <td style={td}>{av.name}</td>
                    <td style={{...td,fontWeight:700}}>
                      {present}/{total}
                      <div style={{background:"#e2e8f0",borderRadius:4,height:4,marginTop:3,overflow:"hidden"}}>
                        <div style={{width:`${pct}%`,height:"100%",background:color,transition:"width .3s"}}/>
                      </div>
                    </td>
                    <td style={{...td,textAlign:"center",fontWeight:800,color}}>{pct}%</td>
                    <td style={{...td,textAlign:"center"}}>
                      <span style={{fontSize:10,background:bg,color,borderRadius:20,padding:"2px 8px",fontWeight:700}}>{lbl}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Settings modal */}
      {settingsModal&&(()=>{
        const gregDate = hebToGreg(hebYear, hebMonth, hebDay);
        const maxDay   = hebMonthDays(hebYear, hebMonth);
        const allVacs  = Object.entries(customVacations||{}).sort(([a],[b])=>a.localeCompare(b));
        return (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:12}} onClick={()=>setSettingsModal(false)}>
            <div style={{background:"#fff",borderRadius:14,width:"100%",maxWidth:420,maxHeight:"88vh",display:"flex",flexDirection:"column",overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
              <div style={{padding:"13px 16px",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
                <span style={{fontWeight:700,fontSize:16}}>⚙️ הגדרות חופשות</span>
                <button style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#64748b"}} onClick={()=>setSettingsModal(false)}>✕</button>
              </div>
              <div style={{overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:14}}>

                {/* Add vacation - Hebrew calendar */}
                <div style={{background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#166534",marginBottom:10}}>➕ הוספת יום חופשה</div>

                  <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                    <label style={{fontSize:12,color:"#475569",fontWeight:600,minWidth:50}}>שנה:</label>
                    <div style={{display:"flex",gap:6}}>
                      {HEB_YEARS.map(y=>(
                        <button key={y} onClick={()=>setHebYear(y)}
                          style={{padding:"4px 12px",borderRadius:7,border:`2px solid ${hebYear===y?"#16a34a":"#e2e8f0"}`,background:hebYear===y?"#16a34a":"#fff",color:hebYear===y?"#fff":"#475569",fontWeight:700,cursor:"pointer",fontSize:12}}>
                          {hebYearLabel(y)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                    <label style={{fontSize:12,color:"#475569",fontWeight:600,minWidth:50}}>חודש:</label>
                    <select style={{...inp,flex:1}} value={hebMonth} onChange={e=>{setHebMonth(e.target.value);setHebDay(1);}}>
                      {HEB_MONTHS.map(m=>(
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{marginBottom:8}}>
                    <label style={{fontSize:12,color:"#475569",fontWeight:600,display:"block",marginBottom:5}}>יום:</label>
                    <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                      {Array.from({length:maxDay},(_,i)=>i+1).map(d=>(
                        <button key={d} onClick={()=>setHebDay(d)}
                          style={{width:28,height:28,borderRadius:6,border:`1.5px solid ${hebDay===d?"#16a34a":"#e2e8f0"}`,background:hebDay===d?"#16a34a":"#fff",color:hebDay===d?"#fff":"#374151",fontWeight:hebDay===d?700:400,cursor:"pointer",fontSize:11}}>
                          {HEB_LETTERS[d]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {gregDate&&(
                    <div style={{background:"#fff",border:"1px solid #d1fae5",borderRadius:7,padding:"5px 10px",fontSize:12,color:"#059669",marginBottom:8,display:"flex",justifyContent:"space-between"}}>
                      <span>תאריך לועזי:</span>
                      <span style={{fontWeight:700}}>{gregDate.split("-").reverse().join("/")} ({toFullHebDate(gregDate)})</span>
                    </div>
                  )}

                  <input style={{...inp,marginBottom:8}} value={newVacLabel} onChange={e=>setNewVacLabel(e.target.value)} placeholder="שם החופשה..."/>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                    {["יום עצמאות","יום הזיכרון","ל״ג בעומר","ט׳ באב","ט׳ בטבת","ישיבת גיוס"].map(s=>(
                      <button key={s} style={{...smallBtn,fontSize:11}} onClick={()=>setNewVacLabel(s)}>{s}</button>
                    ))}
                  </div>
                  <label style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,cursor:"pointer",userSelect:"none",fontSize:12,color:"#166534",fontWeight:600}}>
                    <input type="checkbox" checked={vacEveryYear} onChange={e=>setVacEveryYear(e.target.checked)}
                      style={{width:15,height:15,cursor:"pointer",accentColor:"#16a34a"}}/>
                    📅 כל שנה (לפי התאריך העברי - לכל השנים המוגדרות)
                  </label>
                  <button style={primaryBtn} onClick={()=>{
                    if(!newVacLabel) return;
                    if(vacEveryYear){
                      HEB_YEARS.forEach(y=>{
                        const g=hebToGreg(y,hebMonth,hebDay);
                        if(g) setCustomVacation(g,newVacLabel);
                      });
                    } else {
                      if(!gregDate) return;
                      setCustomVacation(gregDate,newVacLabel);
                    }
                    setNewVacLabel("");
                  }}>הוסף חופשה</button>
                </div>

                {/* Custom vacations list */}
                <div style={{background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#475569",marginBottom:8}}>🏖️ חופשות מוגדרות ({allVacs.length})</div>
                  {allVacs.length===0
                    ? <div style={{color:"#94a3b8",fontSize:12,textAlign:"center"}}>אין חופשות מותאמות</div>
                    : allVacs.map(([d,label])=>(
                        <div key={d} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #f1f5f9",fontSize:12}}>
                          <div>
                            <span style={{fontWeight:700,color:"#7c3aed"}}>{toFullHebDate(d)}</span>
                            <span style={{color:"#64748b",marginRight:6}}>({d.split("-").reverse().join("/")})</span>
                            <span style={{color:"#1e293b"}}>— {label}</span>
                          </div>
                          <button style={delBtn} onClick={()=>removeCustomVacation(d)}>✕</button>
                        </div>
                      ))
                  }
                </div>

                {/* Bein hazmanim list */}
                <div style={{background:"#f0f4ff",border:"1.5px solid #a5b4fc",borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#3730a3",marginBottom:8}}>📅 בין הזמנים</div>
                  {(beinHazmanims||[]).map((bh,i)=>(
                    <div key={i} style={{padding:"6px 0",borderBottom:"1px solid #e0e7ff"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:600,fontSize:11,color:"#1e293b"}}>{bh.label}</div>
                          <div style={{fontSize:10,color:"#6366f1",marginTop:1}}>{toFullHebDate(bh.from)} — {toFullHebDate(bh.to)}</div>
                          <div style={{fontSize:10,color:"#94a3b8"}}>{bh.from.split("-").reverse().join("/")} — {bh.to.split("-").reverse().join("/")}</div>
                        </div>
                        <div style={{display:"flex",gap:4,flexShrink:0,marginRight:6}}>
                          <button style={{...smallBtn,fontSize:10,padding:"2px 7px"}}
                            onClick={()=>{ setEditBhIdx(i); setEditBhData({from:bh.from,to:bh.to,label:bh.label}); }}>✏️</button>
                          <button style={delBtn} onClick={()=>{ if(editBhIdx===i) setEditBhIdx(null); removeBeinHazmanim(i); }}>✕</button>
                        </div>
                      </div>

                      {editBhIdx===i&&(
                        <div style={{background:"#fffbeb",border:"1.5px solid #fbbf24",borderRadius:8,padding:10,marginTop:6}}>
                          <div style={{fontWeight:600,fontSize:11,color:"#92400e",marginBottom:6}}>✏️ עריכה</div>
                          <input style={{...inp,marginBottom:6,fontSize:12}} value={editBhData.label}
                            onChange={e=>setEditBhData(d=>({...d,label:e.target.value}))} placeholder="שם התקופה..."/>
                          <div style={{display:"flex",gap:6,marginBottom:4,alignItems:"center"}}>
                            <span style={{fontSize:11,color:"#64748b",minWidth:52,flexShrink:0}}>מתאריך:</span>
                            <input type="date" style={{...inp,flex:1,fontSize:12,padding:"5px 8px"}} value={editBhData.from}
                              onChange={e=>setEditBhData(d=>({...d,from:e.target.value}))}/>
                            {editBhData.from&&<span style={{fontSize:10,color:"#7c3aed",flexShrink:0}}>{toFullHebDate(editBhData.from)}</span>}
                          </div>
                          <div style={{display:"flex",gap:6,marginBottom:8,alignItems:"center"}}>
                            <span style={{fontSize:11,color:"#64748b",minWidth:52,flexShrink:0}}>עד תאריך:</span>
                            <input type="date" style={{...inp,flex:1,fontSize:12,padding:"5px 8px"}} value={editBhData.to}
                              onChange={e=>setEditBhData(d=>({...d,to:e.target.value}))}/>
                            {editBhData.to&&<span style={{fontSize:10,color:"#7c3aed",flexShrink:0}}>{toFullHebDate(editBhData.to)}</span>}
                          </div>
                          <div style={{display:"flex",gap:6}}>
                            <button style={{flex:1,padding:"7px",background:"#f59e0b",color:"#fff",border:"none",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:12}}
                              onClick={()=>{
                                if(!editBhData.label.trim()||!editBhData.from||!editBhData.to||editBhData.from>editBhData.to) return;
                                updateBeinHazmanim(i,{from:editBhData.from,to:editBhData.to,label:editBhData.label.trim()});
                                setEditBhIdx(null);
                              }}>שמור</button>
                            <button style={{padding:"8px 12px",background:"#f1f5f9",color:"#475569",border:"1px solid #e2e8f0",borderRadius:8,cursor:"pointer",flex:1,fontSize:12}} onClick={()=>setEditBhIdx(null)}>ביטול</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add new bein hazmanim */}
                  <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #e0e7ff"}}>
                    <div style={{fontWeight:600,fontSize:12,color:"#4f46e5",marginBottom:8}}>➕ הוסף בין הזמנים</div>

                    <input style={{...inp,marginBottom:8,fontSize:12}} value={newBh.label}
                      onChange={e=>setNewBh(b=>({...b,label:e.target.value}))}
                      placeholder="שם התקופה (לדוג. בין הזמנים תשרי תשפ״ח)..."/>

                    <div style={{fontWeight:600,fontSize:11,color:"#64748b",marginBottom:4}}>מתאריך:</div>
                    <div style={{display:"flex",gap:5,marginBottom:5,alignItems:"center"}}>
                      {HEB_YEARS.map(y=>(
                        <button key={y} onClick={()=>setNewBh(b=>({...b,yearFrom:y}))}
                          style={{padding:"3px 9px",borderRadius:6,border:`1.5px solid ${newBh.yearFrom===y?"#6366f1":"#e2e8f0"}`,background:newBh.yearFrom===y?"#6366f1":"#fff",color:newBh.yearFrom===y?"#fff":"#475569",fontWeight:600,cursor:"pointer",fontSize:11}}>
                          {hebYearLabel(y)}
                        </button>
                      ))}
                      <select style={{...inp,flex:1,fontSize:11,padding:"4px 6px"}} value={newBh.monthFrom}
                        onChange={e=>setNewBh(b=>({...b,monthFrom:e.target.value,dayFrom:1}))}>
                        {HEB_MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:2,marginBottom:8}}>
                      {Array.from({length:hebMonthDays(newBh.yearFrom, newBh.monthFrom)},(_,i)=>i+1).map(d=>(
                        <button key={d} onClick={()=>setNewBh(b=>({...b,dayFrom:d}))}
                          style={{width:24,height:24,borderRadius:5,border:`1.5px solid ${newBh.dayFrom===d?"#6366f1":"#e2e8f0"}`,background:newBh.dayFrom===d?"#6366f1":"#fff",color:newBh.dayFrom===d?"#fff":"#374151",cursor:"pointer",fontSize:10,fontWeight:newBh.dayFrom===d?700:400}}>
                          {HEB_LETTERS[d]}
                        </button>
                      ))}
                    </div>

                    <div style={{fontWeight:600,fontSize:11,color:"#64748b",marginBottom:4}}>עד תאריך:</div>
                    <div style={{display:"flex",gap:5,marginBottom:5,alignItems:"center"}}>
                      {HEB_YEARS.map(y=>(
                        <button key={y} onClick={()=>setNewBh(b=>({...b,yearTo:y}))}
                          style={{padding:"3px 9px",borderRadius:6,border:`1.5px solid ${newBh.yearTo===y?"#6366f1":"#e2e8f0"}`,background:newBh.yearTo===y?"#6366f1":"#fff",color:newBh.yearTo===y?"#fff":"#475569",fontWeight:600,cursor:"pointer",fontSize:11}}>
                          {hebYearLabel(y)}
                        </button>
                      ))}
                      <select style={{...inp,flex:1,fontSize:11,padding:"4px 6px"}} value={newBh.monthTo}
                        onChange={e=>setNewBh(b=>({...b,monthTo:e.target.value,dayTo:1}))}>
                        {HEB_MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:2,marginBottom:8}}>
                      {Array.from({length:hebMonthDays(newBh.yearTo, newBh.monthTo)},(_,i)=>i+1).map(d=>(
                        <button key={d} onClick={()=>setNewBh(b=>({...b,dayTo:d}))}
                          style={{width:24,height:24,borderRadius:5,border:`1.5px solid ${newBh.dayTo===d?"#6366f1":"#e2e8f0"}`,background:newBh.dayTo===d?"#6366f1":"#fff",color:newBh.dayTo===d?"#fff":"#374151",cursor:"pointer",fontSize:10,fontWeight:newBh.dayTo===d?700:400}}>
                          {HEB_LETTERS[d]}
                        </button>
                      ))}
                    </div>

                    {(()=>{ const gf=hebToGreg(newBh.yearFrom,newBh.monthFrom,newBh.dayFrom); const gt=hebToGreg(newBh.yearTo,newBh.monthTo,newBh.dayTo); return gf&&gt&&(
                      <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:7,padding:"5px 10px",fontSize:11,color:"#1d4ed8",marginBottom:8}}>
                        {toFullHebDate(gf)} — {toFullHebDate(gt)}&nbsp;&nbsp;
                        <span style={{color:"#94a3b8"}}>({gf.split("-").reverse().join("/")} — {gt.split("-").reverse().join("/")})</span>
                      </div>
                    );})()}

                    <label style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,cursor:"pointer",userSelect:"none",fontSize:12,color:"#3730a3",fontWeight:600}}>
                      <input type="checkbox" checked={bhEveryYear} onChange={e=>setBhEveryYear(e.target.checked)}
                        style={{width:15,height:15,cursor:"pointer",accentColor:"#6366f1"}}/>
                      📅 כל שנה (לפי התאריך העברי - לכל השנים המוגדרות)
                    </label>

                    <button style={{...primaryBtn,background:"#6366f1",fontSize:12,padding:"8px"}} onClick={()=>{
                      if(!newBh.label.trim()) return;
                      if(bhEveryYear){
                        HEB_YEARS.forEach(y=>{
                          const gf=hebToGreg(y,newBh.monthFrom,newBh.dayFrom);
                          const gt=hebToGreg(y,newBh.monthTo,newBh.dayTo);
                          if(gf&&gt&&gf<=gt) addBeinHazmanim({from:gf,to:gt,label:newBh.label.trim()});
                        });
                      } else {
                        const gf=hebToGreg(newBh.yearFrom,newBh.monthFrom,newBh.dayFrom);
                        const gt=hebToGreg(newBh.yearTo,newBh.monthTo,newBh.dayTo);
                        if(!gf||!gt||gf>gt) return;
                        addBeinHazmanim({from:gf,to:gt,label:newBh.label.trim()});
                      }
                      setNewBh({yearFrom:_curHebYear,monthFrom:"תשרי",dayFrom:1,yearTo:_curHebYear,monthTo:"תשרי",dayTo:29,label:""});
                    }}>הוסף בין הזמנים</button>
                  </div>
                </div>

                {/* Holidays management */}
                <div style={{background:"#fefce8",border:"1.5px solid #fde68a",borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#92400e",marginBottom:8}}>🎯 ניהול חגים</div>
                  {[...new Map(HOLIDAYS_DB.map(h=>[h.label,h])).values()].map(h=>{
                    const hidden=(hiddenHols||[]).includes(h.label);
                    const dateStr=h.date||(h.from&&h.from)||"";
                    return (
                      <div key={h.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:"1px solid #fef08a",fontSize:11}}>
                        <div>
                          <span style={{color:hidden?"#94a3b8":"#1e293b",textDecoration:hidden?"line-through":"none",fontWeight:600}}>{h.label}</span>
                          {dateStr&&<span style={{color:"#94a3b8",fontSize:10,marginRight:5}}>{dateStr.split("-").reverse().join("/")}{h.from&&h.to?" — "+h.to.split("-").reverse().join("/"):""}</span>}
                        </div>
                        <button style={{fontSize:10,padding:"2px 9px",borderRadius:6,cursor:"pointer",fontWeight:700,border:"none",
                          background:hidden?"#dcfce7":"#fee2e2",color:hidden?"#16a34a":"#dc2626"}}
                          onClick={()=>toggleHolidayHidden(h.label)}>
                          {hidden?"הצג":"הסתר"}
                        </button>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {/* Share modal */}
      {shareModal&&(
        <Modal title="📤 שליחה לסריקוב" onClose={()=>setShareModal(false)}>
          <div style={{background:"#f8fafc",borderRadius:8,padding:10,fontSize:12,whiteSpace:"pre-line",marginBottom:12,maxHeight:220,overflowY:"auto",fontFamily:"monospace",border:"1px solid #e2e8f0",lineHeight:1.9,direction:"rtl"}}>
            {generateMessage()}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button style={{flex:1,padding:"10px",background:"#25d366",color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer"}}
              onClick={()=>window.open(`https://wa.me/?text=${encodeURIComponent(generateMessage())}`,"_blank")}>
              📱 וואטסאפ
            </button>
            <button style={{flex:1,padding:"10px",background:"#2563eb",color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer"}}
              onClick={()=>{ window.location.href=`mailto:anat@bazzjeans.co.il,m0509766686@gmail.com?subject=${encodeURIComponent("נוכחות "+mkMonthLabel(selYear,selMonth))}&body=${encodeURIComponent(generateMessage())}`; }}>
              📧 מייל
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
