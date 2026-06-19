import { useState } from "react";
import { fmt } from "../helpers.js";
import { defaultAvrechim, trackLabel, trackColor, groupLabel, groupColor } from "../constants.js";
import { col, card, inp, iinp, addBtn, primaryBtn, smallBtn, delBtn } from "../styles.js";
import { AvF, FG, Modal } from "./SmallComponents.jsx";
import { CI } from "./SmallComponents.jsx";
import ImportModal from "./ImportModal.jsx";

export default function AvrechimTab({ avrechim, setAvrechim, selKey, prevKey, getAV, setAvMonthField, calcAvrechMonth, totalOwed }){
  const [editId,setEditId]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [showImport,setShowImport]=useState(false);
  const [newAv,setNewAv]=useState({name:"",track:"1000",maxStipend:1600,incomeGroup:"datot"});
  const [search,setSearch]=useState("");
  const updAv=(id,k,v)=>setAvrechim(p=>p.map(a=>a.id===id?{...a,[k]:v}:a));
  const avNames = avrechim.map(a=>a.name).filter(Boolean);
  const filteredAvrechim = avrechim.filter(a=>a.active && a.name.includes(search));

  return (
    <div style={col}>
      <div style={{background:"linear-gradient(135deg,#3b0764,#7c3aed)",borderRadius:12,padding:"14px 16px",color:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
        <div style={{fontSize:13,opacity:.8}}>סה״כ חוב לאברכים החודש</div>
        <div style={{fontSize:34,fontWeight:800}}>{fmt(totalOwed)} ₪</div>
        <div style={{fontSize:11,opacity:.7,marginTop:3}}>כולל פערים מחודש קודם</div>
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
        <div style={{fontWeight:700,fontSize:14,color:"#475569"}}>רשימת אברכים</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <button style={{...addBtn,background:"#f0fdf4",color:"#16a34a",border:"1px solid #86efac"}}
            onClick={()=>setShowImport(true)}>📥 ייבוא JB</button>
          <button style={{...addBtn,background:"#fefce8",color:"#92400e",border:"1px solid #fde68a"}}
            onClick={()=>{ if(window.confirm("זה יעדכן את שמות וסדר האברכים לרשימה הראשית. להמשיך?")) setAvrechim(defaultAvrechim); }}>
            🔄 עדכן שמות
          </button>
          <button style={addBtn} onClick={()=>setShowAdd(true)}>+ הוסף אברך</button>
        </div>
      </div>
      {showImport&&<ImportModal avrechim={avrechim} selKey={selKey} setAvMonthField={setAvMonthField} onClose={()=>setShowImport(false)}/>}

      <div style={{position:"relative"}}>
        <input
          style={{...inp,paddingRight:34,width:"100%"}}
          placeholder="🔍 חיפוש אברך..."
          value={search}
          onChange={e=>setSearch(e.target.value)}
        />
        {search && <button onClick={()=>setSearch("")} style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:16}}>✕</button>}
      </div>

      <datalist id="avrech-names-list">
        {avNames.map((n,i)=><option key={i} value={n}/>)}
      </datalist>

      {filteredAvrechim.map(av=>{
        const c=calcAvrechMonth(av,selKey,prevKey);
        const isEdit=editId===av.id;
        const maxS=Number(av.maxStipend||1600);
        return (
          <div key={av.id} style={{...card,borderRight:`4px solid ${trackColor[av.track]}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                {isEdit
                  ? <input style={iinp} list="avrech-names-list" value={av.name} onChange={e=>updAv(av.id,"name",e.target.value)}/>
                  : <span style={{fontWeight:700,fontSize:15}}>{av.name}</span>}
                <span style={{fontSize:11,color:"#fff",borderRadius:20,padding:"2px 8px",fontWeight:600,background:trackColor[av.track]||"#64748b"}}>{trackLabel[av.track]}</span>
                <span style={{fontSize:11,color:"#fff",borderRadius:20,padding:"2px 8px",fontWeight:600,background:groupColor[c.incomeGroup]||"#64748b"}}>{groupLabel[c.incomeGroup]||"—"}</span>
                <span style={{fontSize:11,color:"#94a3b8"}}>מקס׳ {fmt(maxS)} ₪</span>
              </div>
              <div style={{display:"flex",gap:5}}>
                <button style={smallBtn} onClick={()=>setEditId(isEdit?null:av.id)}>{isEdit?"✓":"✏️"}</button>
                <button style={{...smallBtn,background:"#fee2e2",color:"#dc2626"}} onClick={()=>updAv(av.id,"active",false)}>✕</button>
              </div>
            </div>

            {isEdit && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:8}}>
                <FG label="מסלול">
                  <select style={inp} value={av.track} onChange={e=>updAv(av.id,"track",e.target.value)}>
                    <option value="2000">2,000 ₪</option>
                    <option value="1000">1,000 ₪</option>
                  </select>
                </FG>
                <FG label="קבוצת הכנסה">
                  <select style={inp} value={av.incomeGroup||(av.track==="keren"?"keren":"datot")} onChange={e=>updAv(av.id,"incomeGroup",e.target.value)}>
                    <option value="datot">זכאי דתות</option>
                    <option value="keren">מושהה קרן</option>
                  </select>
                </FG>
                <FG label="מלגה מקסימום (₪)">
                  <input style={inp} type="number" value={maxS} onChange={e=>updAv(av.id,"maxStipend",e.target.value)}/>
                </FG>
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginTop:10}}>
              <AvF label="💰 מגיע לו" val={getAV(selKey,av.id,"monthlyStipend")} onChange={v=>setAvMonthField(selKey,av.id,"monthlyStipend",v)} placeholder={`עד ${fmt(maxS)}`} hi />
              <AvF label="🎓 בחינות"  val={getAV(selKey,av.id,"exams")}           onChange={v=>setAvMonthField(selKey,av.id,"exams",v)} />
              <AvF label="💵 הכניס סריקוב" val={getAV(selKey,av.id,"sarikowGiven")} onChange={v=>setAvMonthField(selKey,av.id,"sarikowGiven",v)} placeholder={`${fmt(c.trackNum)}`} />
            </div>

            {/* תענית דיבור */}
            <div style={{background:"#f0f9ff",border:"1.5px solid #bae6fd",borderRadius:8,padding:"8px 10px",marginTop:6}}>
              <div style={{fontWeight:700,fontSize:12,color:"#0369a1",marginBottom:6}}>🤫 תענית דיבור — 15 ₪ ליום</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,alignItems:"center"}}>
                <div>
                  <label style={{fontSize:11,color:"#0369a1",display:"block",marginBottom:3}}>מספר ימים</label>
                  <input
                    type="number" min="0"
                    value={getAV(selKey,av.id,"taanitDays")}
                    placeholder="0"
                    onChange={e=>setAvMonthField(selKey,av.id,"taanitDays",e.target.value)}
                    style={{border:"1.5px solid #7dd3fc",borderRadius:6,padding:"6px 8px",fontSize:13,width:"100%",boxSizing:"border-box",background:"#fff"}}
                  />
                </div>
                <div style={{textAlign:"center"}}>
                  {c.taanitDays>0 ? (
                    <>
                      <div style={{fontSize:11,color:"#0369a1"}}>סה״כ מזומן</div>
                      <div style={{fontSize:18,fontWeight:800,color:"#0369a1"}}>{fmt(c.taanitAmount)} ₪</div>
                      <div style={{fontSize:10,color:"#64748b"}}>{c.taanitDays} ימים × 15 ₪</div>
                    </>
                  ) : (
                    <div style={{fontSize:11,color:"#94a3b8"}}>הזן ימים לחישוב</div>
                  )}
                </div>
              </div>
              {c.taanitDays>0&&(
                <div style={{marginTop:8,paddingTop:6,borderTop:"1px solid #bae6fd",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,color:"#0369a1",fontWeight:600}}>💵 קיבל במזומן?</span>
                  <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",
                    background:getAV(selKey,av.id,"taanitPaid")==="1"?"#0369a1":"#f1f5f9",
                    border:`2px solid ${getAV(selKey,av.id,"taanitPaid")==="1"?"#0369a1":"#cbd5e1"}`,
                    borderRadius:7,padding:"4px 12px",fontSize:12,fontWeight:600,
                    color:getAV(selKey,av.id,"taanitPaid")==="1"?"#fff":"#64748b",transition:"all .2s",userSelect:"none"}}>
                    <input type="checkbox"
                      checked={getAV(selKey,av.id,"taanitPaid")==="1"}
                      onChange={e=>setAvMonthField(selKey,av.id,"taanitPaid",e.target.checked?"1":"")}
                      style={{width:14,height:14,cursor:"pointer",accentColor:"#0369a1"}}/>
                    {getAV(selKey,av.id,"taanitPaid")==="1"?"✓ קיבל":"סמן קיבל"}
                  </label>
                </div>
              )}
            </div>

            {/* הכנסה + עיגול */}
            <div style={{background:c.incomeGroup==="datot"?"#fffbeb":"#f0fdf4",borderRadius:8,padding:"8px 10px",marginTop:6,fontSize:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
                <span style={{color:groupColor[c.incomeGroup]||"#64748b",fontWeight:700}}>
                  {c.incomeGroup==="datot"
                    ? `🏛️ דתות: ${fmt(c.datot)} ₪ (${fmt(c.totalDatot)} ÷ ${c.datotCount})`
                    : `📚 קרן: ${fmt(c.keren)} ₪ (${fmt(c.totalKeren)} ÷ ${c.kerenCount})`}
                </span>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  {(c.datotRaw!==""||c.kerenRaw!=="")
                    ? <span style={{color:"#dc2626",fontSize:10}}>⚠️ עקיפה</span>
                    : <span style={{color:"#94a3b8",fontSize:10}}>אוטו׳</span>}
                  <button style={{...smallBtn,fontSize:10,padding:"2px 6px"}}
                    onClick={()=>{setAvMonthField(selKey,av.id,"datot","");setAvMonthField(selKey,av.id,"keren","");}}>↺ אפס</button>
                  <button style={{...smallBtn,fontSize:10,padding:"2px 6px",background:"#fef3c7"}}
                    onClick={()=>{
                      if(c.incomeGroup==="datot") setAvMonthField(selKey,av.id,"datot",c.autoDatot);
                      else setAvMonthField(selKey,av.id,"keren",c.autoKeren);
                    }}>✏️ עקוף</button>
                </div>
              </div>

              {(c.datotRaw!==""||c.kerenRaw!=="") && (
                <div style={{marginTop:6}}>
                  {c.incomeGroup==="datot"
                    ? <AvF label="🏛️ דתות ידני (₪)" val={getAV(selKey,av.id,"datot")} onChange={v=>setAvMonthField(selKey,av.id,"datot",v)} />
                    : <AvF label="📚 קרן ידני (₪)"   val={getAV(selKey,av.id,"keren")} onChange={v=>setAvMonthField(selKey,av.id,"keren",v)} />}
                </div>
              )}

              <div style={{marginTop:6,paddingTop:6,borderTop:"1px solid rgba(0,0,0,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{color:"#1d4ed8",fontWeight:600}}>⚖️ עיגול סריקוב מהקופה:</span>
                <span style={{color:"#1e293b",fontWeight:700,fontSize:13}}>
                  {c.incomeGroup==="datot"
                    ? `${fmt(c.trackNum)} − ${fmt(c.datot)} = `
                    : `${fmt(c.trackNum)} − ${fmt(c.keren)} = `}
                  <span style={{color:"#2563eb",fontSize:14}}>{fmt(c.rounding)} ₪</span>
                </span>
              </div>
              {c.sarikowGiven!==c.trackNum && (
                <div style={{marginTop:4,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{color:"#7c3aed",fontWeight:600}}>
                    💵 סריקוב הכניס בפועל {fmt(c.sarikowGiven)} ₪ ⇒ מהקופה:
                  </span>
                  <span style={{color:"#7c3aed",fontWeight:700,fontSize:13}}>{fmt(c.kupaPortion)} ₪</span>
                </div>
              )}
            </div>

            {c.monthly>0 && (
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-around",background:"#f8fafc",borderRadius:8,padding:"8px 4px",marginTop:8,gap:4,flexWrap:"wrap"}}>
                <CI l="מגיע לו"  v={c.monthly} />
                <span style={{color:"#94a3b8"}}>−</span>
                <CI l="מהקופה (סריקוב)" v={c.kupaPortion} />
                {c.exams>0&&<><span style={{color:"#94a3b8"}}>+</span><CI l="בחינות" v={c.exams}/></>}
                {c.prevBankGap!==0&&<><span style={{color:"#94a3b8"}}>{c.prevBankGap>0?"+":"−"}</span><CI l="פער קודם" v={Math.abs(c.prevBankGap)}/></>}
                {c.holiday>0&&<><span style={{color:"#94a3b8"}}>+</span><CI l="🎉 חג" v={c.holiday} color="#b45309"/></>}
                {c.depositRounding>0&&<><span style={{color:"#94a3b8"}}>+</span><CI l="⭕ עיגול" v={c.depositRounding} color="#7c3aed"/></>}
                <span style={{color:"#94a3b8"}}>=</span>
                <CI l="🏦 לבנק" v={c.totalToBank} bold color={c.totalToBank>=0?"#16a34a":"#dc2626"} />
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
              <AvF label="🎉 חג (₪)" val={getAV(selKey,av.id,"holiday")} onChange={v=>setAvMonthField(selKey,av.id,"holiday",v)} />
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <label style={{fontSize:10,color:"#7c3aed",fontWeight:700}}>⭕ עיגול הפקדה (₪)</label>
                <div style={{display:"flex",gap:4}}>
                  <input style={{border:"1px solid #c4b5fd",borderRadius:6,padding:"5px 6px",fontSize:12,flex:1,minWidth:0,boxSizing:"border-box"}}
                    type="number" value={getAV(selKey,av.id,"depositRounding")} placeholder="0"
                    onChange={e=>setAvMonthField(selKey,av.id,"depositRounding",e.target.value)}/>
                  <button style={{...smallBtn,background:"#ede9fe",color:"#7c3aed",border:"1px solid #c4b5fd",whiteSpace:"nowrap",padding:"3px 7px",fontSize:11}}
                    onClick={()=>{
                      const base=c.effectiveBank+(Number(getAV(selKey,av.id,"holiday"))||0);
                      const rounded=Math.ceil(base/10)*10;
                      setAvMonthField(selKey,av.id,"depositRounding",rounded-base>0?rounded-base:0);
                    }}>עגל↑10</button>
                </div>
              </div>
            </div>

            {c.totalToBank>0&&(
              <div style={{background:"#ecfdf5",border:"1.5px solid #34d399",borderRadius:8,padding:"7px 12px",marginTop:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,color:"#059669",fontWeight:700}}>💰 סה״כ להפקדה:</span>
                <span style={{fontSize:16,fontWeight:800,color:"#059669"}}>{fmt(c.totalToBank)} ₪</span>
              </div>
            )}
            {c.totalToBank<0&&(
              <div style={{background:"#fef2f2",border:"1.5px solid #f87171",borderRadius:8,padding:"7px 12px",marginTop:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,color:"#dc2626",fontWeight:700}}>⚠️ האברך צריך להחזיר:</span>
                <span style={{fontSize:16,fontWeight:800,color:"#dc2626"}}>{fmt(Math.abs(c.totalToBank))} ₪</span>
              </div>
            )}

            {c.totalToBank>0&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:6}}>
                <div style={{display:"flex",flexDirection:"column",gap:3}}>
                  <label style={{fontSize:10,color:"#0369a1",fontWeight:700}}>🏦 הפקדה לבנק (₪)</label>
                  <input style={{border:`2px solid ${getAV(selKey,av.id,"bankDeposit")!==""?"#f59e0b":"#7dd3fc"}`,borderRadius:6,padding:"5px 6px",fontSize:12,width:"100%",boxSizing:"border-box"}}
                    type="number"
                    value={getAV(selKey,av.id,"bankDeposit")!==""?getAV(selKey,av.id,"bankDeposit"):(c.totalToBank||"")}
                    onChange={e=>setAvMonthField(selKey,av.id,"bankDeposit",e.target.value)}/>
                </div>
                <div style={{background:c.cashAmount>0?"#fefce8":"#f8fafc",border:`1.5px solid ${c.cashAmount>0?"#fde047":"#e2e8f0"}`,borderRadius:8,padding:"6px 10px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
                  <span style={{fontSize:10,color:"#92400e",fontWeight:700}}>💵 מזומן</span>
                  <span style={{fontSize:16,fontWeight:800,color:c.cashAmount>0?"#b45309":"#94a3b8"}}>
                    {c.cashAmount>0?fmt(c.cashAmount)+" ₪":"—"}
                  </span>
                </div>
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <label style={{fontSize:10,color:"#059669",fontWeight:700}}>
                  🏦 הכנסתי לבנק (₪)
                  {getAV(selKey,av.id,"actualBank")===""&&c.totalToBank>0&&<span style={{color:"#94a3b8",fontWeight:400}}> — אוטו׳</span>}
                </label>
                <input
                  style={{border:`2px solid ${getAV(selKey,av.id,"actualBank")!==""?"#f59e0b":"#34d399"}`,borderRadius:6,padding:"5px 6px",fontSize:12,width:"100%",boxSizing:"border-box"}}
                  type="number"
                  value={getAV(selKey,av.id,"actualBank")!==""?getAV(selKey,av.id,"actualBank"):(c.bankDeposit||"")}
                  onChange={e=>{
                    const v=e.target.value;
                    setAvMonthField(selKey,av.id,"actualBank",v);
                    const actual=v!==""?Number(v):null;
                    if(actual!==null){
                      setAvMonthField(selKey,av.id,"bankGap",c.effectiveBank-(actual+c.cashAmount-c.holiday-c.depositRounding));
                    }
                  }}
                />
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <label style={{fontSize:10,color:c.bankGap>0?"#dc2626":c.bankGap<0?"#2563eb":"#64748b",fontWeight:700}}>
                  {c.bankGap>0?"⬆️ חייב לו (לחודש הבא)":c.bankGap<0?"⬇️ שילמתי יותר (לנכות)":"↔️ פער לחודש הבא"}
                </label>
                <input
                  style={{border:`2px solid ${c.bankGap>0?"#fca5a5":c.bankGap<0?"#93c5fd":"#e2e8f0"}`,borderRadius:6,padding:"5px 6px",fontSize:12,width:"100%",boxSizing:"border-box"}}
                  type="number" value={getAV(selKey,av.id,"bankGap")} placeholder="0"
                  onChange={e=>setAvMonthField(selKey,av.id,"bankGap",e.target.value)}
                />
              </div>
            </div>

            {getAV(selKey,av.id,"actualBank")!==""&&c.bankGap!==0&&(
              <div style={{background:c.bankGap>0?"#fef2f2":"#eff6ff",borderRadius:8,padding:"5px 10px",marginTop:4,fontSize:12}}>
                <span style={{color:c.bankGap>0?"#dc2626":"#2563eb",fontWeight:600}}>
                  {c.bankGap>0
                    ? `⬆️ חסר ${fmt(c.bankGap)} ₪ — יתווסף לחישוב בנק חודש הבא`
                    : `⬇️ שולם ${fmt(Math.abs(c.bankGap))} ₪ יותר — יקוזז מבנק חודש הבא`}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {avrechim.some(a=>!a.active)&&(
        <div style={card}>
          <div style={{fontWeight:700,color:"#94a3b8",marginBottom:6}}>לא פעילים</div>
          {avrechim.filter(a=>!a.active).map(av=>(
            <div key={av.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",color:"#94a3b8"}}>
              <span>{av.name}</span>
              <button style={smallBtn} onClick={()=>updAv(av.id,"active",true)}>שחזר</button>
            </div>
          ))}
        </div>
      )}

      {showAdd&&(
        <Modal title="הוספת אברך חדש" onClose={()=>setShowAdd(false)}>
          <FG label="שם"><input style={inp} list="avrech-names-list" value={newAv.name} onChange={e=>setNewAv(p=>({...p,name:e.target.value}))} placeholder="שם האברך"/></FG>
          <FG label="מסלול">
            <select style={inp} value={newAv.track} onChange={e=>setNewAv(p=>({...p,track:e.target.value}))}>
              <option value="2000">2,000 ₪</option>
              <option value="1000">1,000 ₪</option>
            </select>
          </FG>
          <FG label="קבוצת הכנסה">
            <select style={inp} value={newAv.incomeGroup||"datot"} onChange={e=>setNewAv(p=>({...p,incomeGroup:e.target.value}))}>
              <option value="datot">זכאי דתות</option>
              <option value="keren">מושהה קרן</option>
            </select>
          </FG>
          <FG label="מלגה מקסימום (₪)">
            <input style={inp} type="number" value={newAv.maxStipend} onChange={e=>setNewAv(p=>({...p,maxStipend:e.target.value}))} placeholder="1600"/>
          </FG>
          <button style={primaryBtn} onClick={()=>{
            if(!newAv.name) return;
            setAvrechim(p=>[...p,{...newAv,id:Date.now(),active:true,incomeGroup:newAv.incomeGroup||"datot"}]);
            setNewAv({name:"",track:"1000",maxStipend:1600,incomeGroup:"datot"});
            setShowAdd(false);
          }}>הוסף אברך</button>
        </Modal>
      )}
    </div>
  );
}
