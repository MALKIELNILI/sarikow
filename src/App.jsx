import { useState, useEffect, useRef } from "react";
import { fbSet, fbListen } from "./firebase.js";
import {
  defaultAvrechim, BEIN_HAZMANIM, mkMonthKey, mkMonthLabel, emptyMonthData
} from "./constants.js";
import { fmt, getDayType } from "./helpers.js";
import { smallBtn } from "./styles.js";
import MainTab from "./components/MainTab.jsx";
import AvrechimTab from "./components/AvrechimTab.jsx";
import AttendanceTab from "./components/AttendanceTab.jsx";
import SummaryTab from "./components/SummaryTab.jsx";
import BankTab from "./components/BankTab.jsx";
import SettlementTab from "./components/SettlementTab.jsx";

const now = new Date();

export default function App(){
  const [ready,setReady]         = useState(false);
  const [tab,setTab]             = useState("main");
  const [syncing,setSyncing]     = useState(false);
  const [baseBalance,setBaseBS]  = useState({amount:191321,date:"29.1.26"});
  const [avrechim,setAvrechimS]  = useState(defaultAvrechim);
  const [supplementSettings,setSupplementS] = useState({datot:1000,keren:1000});
  const [allMonths,setAllMonthsS]= useState({});
  const [avAllMonths,setAvAllMS]     = useState({});
  const [attendance,setAttendanceS]  = useState({});
  const [customVacations,setCustomVacS] = useState({});
  const [beinHazmanims,setBeinHazmanims] = useState(BEIN_HAZMANIM);
  const [hiddenHols,   setHiddenHols]   = useState([]);
  const [selYear,setSelYear]     = useState(now.getFullYear());
  const [selMonth,setSelMonth]   = useState(now.getMonth());

  const selKey = mkMonthKey(selYear,selMonth);

  const local = useRef({baseBalance,avrechim,allMonths:{},avAllMonths:{},attendance:{},customVacations:{},beinHazmanims:BEIN_HAZMANIM,hiddenHols:[],supplementSettings:{datot:1000,keren:1000}});

  useEffect(()=>{
    let loaded={base:false,av:false,months:false,avmonths:false,att:false,cv:false,bh:false,hh:false,supp:false};
    const check=()=>{ if(loaded.base&&loaded.av&&loaded.months&&loaded.avmonths&&loaded.att&&loaded.cv&&loaded.bh&&loaded.hh&&loaded.supp) setReady(true); };
    const u1=fbListen("baseBalance",v=>{ if(v){setBaseBS(v);local.current.baseBalance=v;} loaded.base=true;check(); });
    const u2=fbListen("avrechim",v=>{
      if(v&&Array.isArray(v)){
        const nameMap={}; defaultAvrechim.forEach(d=>{ nameMap[d.id]=d.name; });
        const fixed=v.map(av=>nameMap[av.id]?{...av,name:nameMap[av.id]}:av);
        const defIds=defaultAvrechim.map(d=>d.id);
        const extras=fixed.filter(av=>!defIds.includes(av.id));
        const ordered=[...defIds.map(id=>fixed.find(av=>av.id===id)).filter(Boolean),...extras];
        setAvrechimS(ordered); local.current.avrechim=ordered;
        const changed=ordered.length!==v.length||ordered.some((a,i)=>a.id!==v[i]?.id||a.name!==v[i]?.name);
        if(changed) fbSet("avrechim",ordered);
      }
      loaded.av=true;check();
    });
    const u3=fbListen("allMonths",v=>{ const d=v||{}; setAllMonthsS(d);local.current.allMonths=d; loaded.months=true;check(); });
    const u4=fbListen("avAllMonths",v=>{ const d=v||{}; setAvAllMS(d);local.current.avAllMonths=d; loaded.avmonths=true;check(); });
    const u5=fbListen("attendance",v=>{ const d=v||{}; setAttendanceS(d);local.current.attendance=d; loaded.att=true;check(); });
    const u6=fbListen("customVacations",v=>{ const d=v||{}; setCustomVacS(d);local.current.customVacations=d; loaded.cv=true;check(); });
    const u7=fbListen("beinHazmanims",v=>{
      if(v&&Array.isArray(v)&&v.length>0){ setBeinHazmanims(v); local.current.beinHazmanims=v; }
      else { setBeinHazmanims(BEIN_HAZMANIM); local.current.beinHazmanims=BEIN_HAZMANIM; if(!v) fbSet("beinHazmanims",BEIN_HAZMANIM); }
      loaded.bh=true;check();
    });
    const u8=fbListen("hiddenHols",v=>{ const d=v||[]; setHiddenHols(d);local.current.hiddenHols=d; loaded.hh=true;check(); });
    const u9=fbListen("supplementSettings",v=>{ if(v&&typeof v==="object"){setSupplementS(v);local.current.supplementSettings=v;} loaded.supp=true;check(); });
    return()=>{ u1();u2();u3();u4();u5();u6();u7();u8();u9(); };
  },[]);

  const sync = fn => { setSyncing(true); fn(); setTimeout(()=>setSyncing(false),1200); };
  const setBaseBalance = v => { setBaseBS(v); sync(()=>fbSet("baseBalance",v)); };
  const setAvrechim    = fn => { const n=typeof fn==="function"?fn(local.current.avrechim):fn; local.current.avrechim=n; setAvrechimS(n); sync(()=>fbSet("avrechim",n)); };

  const setSupplementSettings = v => { setSupplementS(v); local.current.supplementSettings=v; sync(()=>fbSet("supplementSettings",v)); };

  const setMonthField = (key,field,val) => {
    const cur = local.current.allMonths;
    const upd = {...cur,[key]:{...emptyMonthData(),...(cur[key]||{}),[field]:val}};
    local.current.allMonths=upd; setAllMonthsS(upd); sync(()=>fbSet("allMonths",upd));
  };
  const setAvMonthField = (monthKey,avId,field,val) => {
    const cur = local.current.avAllMonths;
    const upd = {...cur,[monthKey]:{...(cur[monthKey]||{}),[avId]:{...(cur[monthKey]?.[avId]||{}),[field]:val}}};
    local.current.avAllMonths=upd; setAvAllMS(upd); sync(()=>fbSet("avAllMonths",upd));
  };
  const setAttendanceDay = (monthKey,avId,dateStr,val) => {
    const cur=local.current.attendance||{};
    const sid=String(avId);
    const upd={...cur,[monthKey]:{...(cur[monthKey]||{}),[sid]:{...(cur[monthKey]?.[sid]||{}),[dateStr]:val}}};
    local.current.attendance=upd; setAttendanceS(upd); sync(()=>fbSet("attendance",upd));
  };
  const fillMonthBatch = (monthKey,avrechiList,weeksData,customVacs) => {
    const cur=local.current.attendance||{};
    const md={...(cur[monthKey]||{})};
    const bzList=local.current.beinHazmanims||BEIN_HAZMANIM;
    const hh=local.current.hiddenHols||[];
    avrechiList.forEach(av=>{
      const ad={...(md[String(av.id)]||{})};
      weeksData.forEach(week=>week.forEach(day=>{
        if(day.inMonth && getDayType(day.dateStr,customVacs,bzList,hh).type==="learning") ad[day.dateStr]="1";
      }));
      md[String(av.id)]=ad;
    });
    const upd={...cur,[monthKey]:md};
    local.current.attendance=upd; setAttendanceS(upd); sync(()=>fbSet("attendance",upd));
  };
  const setCustomVacation = (dateStr,label) => {
    const cur=local.current.customVacations||{};
    const upd={...cur,[dateStr]:label};
    local.current.customVacations=upd; setCustomVacS(upd); sync(()=>fbSet("customVacations",upd));
  };
  const removeCustomVacation = (dateStr) => {
    const cur={...(local.current.customVacations||{})};
    delete cur[dateStr];
    local.current.customVacations=cur; setCustomVacS(cur); sync(()=>fbSet("customVacations",cur));
  };
  const addBeinHazmanim = entry => {
    const cur=[...(local.current.beinHazmanims||BEIN_HAZMANIM)];
    const upd=[...cur,entry].sort((a,b)=>a.from.localeCompare(b.from));
    local.current.beinHazmanims=upd; setBeinHazmanims(upd); sync(()=>fbSet("beinHazmanims",upd));
  };
  const removeBeinHazmanim = idx => {
    const cur=[...(local.current.beinHazmanims||BEIN_HAZMANIM)];
    const upd=cur.filter((_,i)=>i!==idx);
    local.current.beinHazmanims=upd; setBeinHazmanims(upd); sync(()=>fbSet("beinHazmanims",upd));
  };
  const toggleHolidayHidden = label => {
    const cur=local.current.hiddenHols||[];
    const upd=cur.includes(label)?cur.filter(l=>l!==label):[...cur,label];
    local.current.hiddenHols=upd; setHiddenHols(upd); sync(()=>fbSet("hiddenHols",upd));
  };
  const updateBeinHazmanim = (idx, entry) => {
    const cur=[...(local.current.beinHazmanims||BEIN_HAZMANIM)];
    cur[idx]=entry;
    const upd=[...cur].sort((a,b)=>a.from.localeCompare(b.from));
    local.current.beinHazmanims=upd; setBeinHazmanims(upd); sync(()=>fbSet("beinHazmanims",upd));
  };

  const getMD = (key,field,def=0) => allMonths[key]?.[field] ?? def;
  const getAV = (monthKey,avId,field,def="") => avAllMonths[monthKey]?.[avId]?.[field] ?? def;

  // MONTH CALCULATIONS
  const calcAvrechMonth = (av, monthKey, prevMonthKey) => {
    const monthly  = Number(getAV(monthKey,av.id,"monthlyStipend"))||0;
    const exams    = Number(getAV(monthKey,av.id,"exams"))||0;
    const incomeGroup = av.incomeGroup || (av.track==="keren" ? "keren" : "datot");
    const trackNum = (av.track==="keren") ? 1000 : (Number(av.track)||1000);

    const datotCount = avrechim.filter(a=>a.active && (a.incomeGroup||( a.track==="keren"?"keren":"datot"))==="datot").length;
    const kerenCount = avrechim.filter(a=>a.active && (a.incomeGroup||(a.track==="keren"?"keren":"datot"))==="keren").length;
    const totalDatot = Number(getMD(monthKey,"datot"))||0;
    const totalKeren = Number(getMD(monthKey,"keren"))||0;
    const autoDatot  = (incomeGroup==="datot" && datotCount>0) ? totalDatot/datotCount : 0;
    const autoKeren  = (incomeGroup==="keren" && kerenCount>0) ? totalKeren/kerenCount : 0;

    const datotRaw = getAV(monthKey,av.id,"datot");
    const kerenRaw = getAV(monthKey,av.id,"keren");
    const datot = datotRaw!==""?Number(datotRaw):autoDatot;
    const keren = kerenRaw!==""?Number(kerenRaw):autoKeren;

    const rounding = Math.max(0, trackNum - datot - keren);
    const sarikowGivenRaw = getAV(monthKey,av.id,"sarikowGiven");
    const sarikowGiven = sarikowGivenRaw!==""?Number(sarikowGivenRaw):trackNum;
    const kupaPortion = sarikowGiven - datot - keren;
    const bank = monthly - kupaPortion + exams;
    const prevBankGap = 0;
    const effectiveBank = bank;

    const suppAmt = incomeGroup==="keren"
      ? Number((local.current.supplementSettings||supplementSettings)?.keren||0)
      : Number((local.current.supplementSettings||supplementSettings)?.datot||0);
    const externalPerAvrech = autoDatot + autoKeren;
    const totalReceived = externalPerAvrech + suppAmt;
    const settlementBalance = monthly > 0 ? monthly - totalReceived : 0;
    const actualBankRaw = getAV(monthKey,av.id,"actualBank");
    const actualBank = actualBankRaw!==""?Number(actualBankRaw):null;
    const holiday = Number(getAV(monthKey,av.id,"holiday"))||0;
    const depositRounding = Number(getAV(monthKey,av.id,"depositRounding"))||0;
    const totalToBank = effectiveBank + holiday + depositRounding;
    const bankDepositRaw = getAV(monthKey,av.id,"bankDeposit");
    const bankDeposit = bankDepositRaw!==""?Number(bankDepositRaw):totalToBank;
    const cashAmount = Math.max(0, totalToBank - bankDeposit);
    const actualBankForGap = actualBank!==null ? actualBank : (totalToBank>0 ? bankDeposit : null);
    const bankGapRaw = getAV(monthKey,av.id,"bankGap");
    const bankGapAuto = actualBankForGap!==null ? effectiveBank - (actualBankForGap + cashAmount - holiday - depositRounding) : 0;
    const bankGap = bankGapRaw!==""?Number(bankGapRaw):bankGapAuto;
    const taanitDays   = Number(getAV(monthKey,av.id,"taanitDays"))||0;
    const taanitAmount = taanitDays * 15;

    return { monthly, datot, keren, autoDatot, autoKeren, datotRaw, kerenRaw, rounding, sarikowGivenRaw, sarikowGiven, kupaPortion, exams, bank, prevBankGap, effectiveBank, actualBank, holiday, depositRounding, totalToBank, bankDeposit, cashAmount, bankGapAuto, bankGap, trackNum, datotCount, kerenCount, incomeGroup, totalDatot, totalKeren, taanitDays, taanitAmount, suppAmt, externalPerAvrech, totalReceived, settlementBalance };
  };

  const allMonthKeys = () => {
    const keys = new Set();
    Object.keys(allMonths).forEach(k=>keys.add(k));
    Object.keys(avAllMonths).forEach(k=>keys.add(k));
    keys.add(selKey);
    return Array.from(keys).sort();
  };

  const getPrevMonthKey = (key) => {
    const sorted = allMonthKeys();
    const idx = sorted.indexOf(key);
    return idx>0 ? sorted[idx-1] : null;
  };

  const calcMonthTotals = (monthKey) => {
    const prevKey = getPrevMonthKey(monthKey);
    const donors  = (allMonths[monthKey]?.donors||[]).reduce((s,d)=>s+Number(d.amount||0),0);
    const datotDraft = Number(getMD(monthKey,"datot"));
    const kerenDraft = Number(getMD(monthKey,"keren"));
    const datot   = Number(getMD(monthKey,"datotConfirmed"));
    const keren   = Number(getMD(monthKey,"kerenConfirmed"));
    const income  = donors+datot+keren;
    const totalRounding = avrechim.filter(a=>a.active).reduce((s,av)=>{
      const c=calcAvrechMonth(av,monthKey,prevKey);
      return s+c.rounding;
    },0);
    const sent = Number(getMD(monthKey,"sent2000"))*2000+Number(getMD(monthKey,"sent1000"))*1000+Number(getMD(monthKey,"sentKeren"))*1000;
    const adjustment = Number(getMD(monthKey,"adjustment"))||0;
    const net = income - sent + adjustment;
    return { donors, datot, keren, datotDraft, kerenDraft, income, totalRounding, sent, adjustment, net };
  };

  const baseMonthKey = baseBalance.monthKey || "0000-00";

  const monthHasActivity = k => {
    const md = allMonths[k]||{};
    return (md.donors||[]).length > 0 ||
      Number(md.datotConfirmed||0) > 0 ||
      Number(md.kerenConfirmed||0) > 0 ||
      Number(md.sent2000||0) > 0 ||
      Number(md.sent1000||0) > 0 ||
      Number(md.sentKeren||0)> 0 ||
      Number(md.adjustment||0)!==0;
  };

  const liveBalance = (() => {
    let sum = Number(baseBalance.amount||0);
    allMonthKeys().forEach(k=>{
      if(k >= baseMonthKey && monthHasActivity(k)) sum += calcMonthTotals(k).net;
    });
    return sum;
  })();

  const curTotals = calcMonthTotals(selKey);
  const prevKey   = getPrevMonthKey(selKey);

  const donorHistory = (() => {
    const map = {};
    Object.entries(allMonths)
      .sort(([a],[b])=>a.localeCompare(b))
      .forEach(([,m])=>{
        (m.donors||[]).forEach(d=>{
          if(d.name && Number(d.amount)>0) map[d.name]=Number(d.amount);
        });
      });
    return map;
  })();
  const allDonorNames = Object.keys(donorHistory);

  const totalOwed = avrechim.filter(a=>a.active).reduce((s,av)=>s+calcAvrechMonth(av,selKey,prevKey).effectiveBank,0);

  if(!ready) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",gap:16,color:"#475569"}}>
      <div style={{fontSize:32,fontWeight:800,color:"#1e3a5f"}}>סריקוב</div>
      <div style={{fontSize:14,opacity:.7}}>מתחבר לענן...</div>
      <div style={{width:40,height:40,border:"4px solid #e2e8f0",borderTop:"4px solid #2563eb",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
    </div>
  );

  const tabS = t => ({padding:"7px 11px",borderRadius:8,border:tab===t?"2px solid #1e3a5f":"2px solid #e2e8f0",background:tab===t?"#1e3a5f":"#f8fafc",cursor:"pointer",fontWeight:600,fontSize:12,color:tab===t?"#fff":"#64748b"});

  return (
    <div style={{minHeight:"100vh",background:"#f1f5f9"}}>
      <header style={{background:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:720,margin:"0 auto",padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <img src="./logo.jpg" alt="לוגו" style={{height:52,width:"auto",objectFit:"contain"}}/>
            <div>
              <div style={{fontSize:20,fontWeight:800,color:"#1e3a5f"}}>סריקוב</div>
              <div style={{fontSize:10,color:"#94a3b8",display:"flex",alignItems:"center",gap:4}}>
                מערכת ניהול כספים
                <span style={{width:6,height:6,borderRadius:"50%",background:syncing?"#f59e0b":"#22c55e",display:"inline-block"}}/>
                <span>{syncing?"שומר...":"מסונכרן ☁️"}</span>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            <button onClick={()=>setTab("main")}       style={tabS("main")}>🏠 ראשי</button>
            <button onClick={()=>setTab("avrechim")}   style={tabS("avrechim")}>👨‍🎓 אברכים</button>
            <button onClick={()=>setTab("attendance")} style={tabS("attendance")}>📋 נוכחות</button>
            <button onClick={()=>setTab("summary")}    style={tabS("summary")}>📂 סיכומים</button>
            <button onClick={()=>setTab("bank")}       style={tabS("bank")}>🏦 בנק</button>
            <button onClick={()=>setTab("settlement")} style={tabS("settlement")}>💰 חשבון</button>
          </div>
        </div>
      </header>

      {/* Month Selector */}
      <div style={{maxWidth:720,margin:"0 auto",padding:"10px 14px 0"}}>
        <div style={{background:"#fff",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",flexWrap:"wrap"}}>
          <span style={{fontWeight:700,fontSize:13,color:"#1e3a5f"}}>📅 חודש:</span>
          <button onClick={()=>{ let m=selMonth-1,y=selYear; if(m<0){m=11;y--;} setSelMonth(m);setSelYear(y); }}
            style={{...smallBtn,fontSize:16,padding:"2px 10px"}}>‹</button>
          <span style={{fontWeight:700,fontSize:15,color:"#1e293b",minWidth:110,textAlign:"center"}}>{mkMonthLabel(selYear,selMonth)}</span>
          <button onClick={()=>{ let m=selMonth+1,y=selYear; if(m>11){m=0;y++;} setSelMonth(m);setSelYear(y); }}
            style={{...smallBtn,fontSize:16,padding:"2px 10px"}}>›</button>
          <div style={{marginRight:"auto",display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:12,color:"#64748b"}}>יתרה חיה:</span>
            <span style={{fontWeight:800,fontSize:15,color:"#2563eb"}}>{fmt(liveBalance)} ₪</span>
          </div>
        </div>
      </div>

      <main style={{maxWidth:720,margin:"0 auto",padding:"12px 14px"}}>
        {tab==="main"       && <MainTab selKey={selKey} selYear={selYear} selMonth={selMonth} baseBalance={baseBalance} setBaseBalance={setBaseBalance} liveBalance={liveBalance} curTotals={curTotals} allMonths={allMonths} getMD={getMD} setMonthField={setMonthField} syncing={syncing} allDonorNames={allDonorNames} donorHistory={donorHistory} avrechim={avrechim} />}
        {tab==="avrechim"   && <AvrechimTab avrechim={avrechim} setAvrechim={setAvrechim} selKey={selKey} prevKey={prevKey} getAV={getAV} setAvMonthField={setAvMonthField} calcAvrechMonth={calcAvrechMonth} totalOwed={totalOwed} />}
        {tab==="attendance" && <AttendanceTab avrechim={avrechim} selKey={selKey} selYear={selYear} selMonth={selMonth} attendance={attendance} setAttendanceDay={setAttendanceDay} fillMonthBatch={fillMonthBatch} customVacations={customVacations} setCustomVacation={setCustomVacation} removeCustomVacation={removeCustomVacation} beinHazmanims={beinHazmanims} addBeinHazmanim={addBeinHazmanim} removeBeinHazmanim={removeBeinHazmanim} updateBeinHazmanim={updateBeinHazmanim} hiddenHols={hiddenHols} toggleHolidayHidden={toggleHolidayHidden} />}
        {tab==="summary"    && <SummaryTab avrechim={avrechim} allMonthKeys={allMonthKeys()} calcMonthTotals={calcMonthTotals} calcAvrechMonth={calcAvrechMonth} getPrevMonthKey={getPrevMonthKey} baseBalance={baseBalance} liveBalance={liveBalance} selKey={selKey} allMonths={allMonths} />}
        {tab==="bank"       && <BankTab avrechim={avrechim} selKey={selKey} prevKey={prevKey} calcAvrechMonth={calcAvrechMonth} selYear={selYear} selMonth={selMonth} getAV={getAV} setAvMonthField={setAvMonthField} />}
        {tab==="settlement" && <SettlementTab avrechim={avrechim} selKey={selKey} prevKey={prevKey} calcAvrechMonth={calcAvrechMonth} selYear={selYear} selMonth={selMonth} getAV={getAV} setAvMonthField={setAvMonthField} supplementSettings={supplementSettings} setSupplementSettings={setSupplementSettings} />}
      </main>
    </div>
  );
}
