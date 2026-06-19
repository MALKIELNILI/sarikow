import { fmt, fmtSigned } from "../helpers.js";
import { inp, smallBtn, primaryBtn } from "../styles.js";

export function Chip({label,val,pos,neg}){
  const bg=pos?"rgba(34,197,94,0.22)":neg?"rgba(239,68,68,0.22)":"rgba(255,255,255,0.14)";
  return <div style={{background:bg,borderRadius:8,padding:"4px 10px",fontSize:12,display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
    <span style={{opacity:.7,fontSize:10}}>{label}</span><span style={{fontWeight:700}}>{val}</span>
  </div>;
}

export function BalanceConfirm({draft,confirmed,prevConfirmed,onConfirm,onUndo}){
  const d=Number(draft)||0, c=Number(confirmed)||0;
  const diff=d-c;
  const hasPrev = prevConfirmed!==null && prevConfirmed!==undefined;
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:5,marginTop:4,flexWrap:"wrap"}}>
      <span style={{fontSize:11,color:diff!==0?"#dc2626":"#16a34a",whiteSpace:"nowrap"}}>
        {diff!==0 ? `ממתין ליתרה: ${fmtSigned(diff)} ₪` : "✓ מעודכן ביתרה"}
      </span>
      <div style={{display:"flex",gap:5}}>
        {hasPrev && <button style={{...smallBtn,whiteSpace:"nowrap",background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca"}} onClick={onUndo}>↩ בטל</button>}
        <button style={{...smallBtn,whiteSpace:"nowrap",opacity:diff===0?0.5:1}} disabled={diff===0} onClick={onConfirm}>+ הוסף לסכום</button>
      </div>
    </div>
  );
}

export function IField({label,value,onChange}){
  return <div style={{display:"flex",flexDirection:"column",gap:4}}>
    <label style={{fontSize:12,color:"#64748b",fontWeight:600}}>{label}</label>
    <input style={inp} type="number" value={value||""} onChange={e=>onChange(e.target.value)} placeholder="0"/>
  </div>;
}

export function AvF({label,val,onChange,placeholder,hi}){
  return <div style={{display:"flex",flexDirection:"column",gap:3}}>
    <label style={{fontSize:10,color:hi?"#4f46e5":"#64748b",fontWeight:hi?700:400}}>{label}</label>
    <input style={{border:hi?"2px solid #6366f1":"1px solid #e2e8f0",borderRadius:6,padding:"5px 6px",fontSize:12,width:"100%",boxSizing:"border-box"}}
      type="number" value={val} onChange={e=>onChange(e.target.value)} placeholder={placeholder||"0"}/>
  </div>;
}

export function CI({l,v,bold,color}){
  return <div style={{textAlign:"center"}}>
    <div style={{fontSize:10,color:"#94a3b8"}}>{l}</div>
    <div style={{fontWeight:bold?700:600,color:color||"#1e293b",fontSize:bold?15:13}}>{fmt(v)} ₪</div>
  </div>;
}

export function CBox({label,val}){
  return <div style={{background:"#f0f9ff",borderRadius:8,padding:"7px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
    <span style={{fontSize:11,color:"#64748b"}}>{label}</span>
    <span style={{fontWeight:700,color:"#0369a1"}}>{val}</span>
  </div>;
}

export function MR({l,v,bold,neg,color}){
  return <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontWeight:bold?700:400}}>
    <span style={{color:"#475569"}}>{l}</span>
    <span style={{color:color||(neg?"#dc2626":"#1e293b")}}>{fmt(v)} ₪</span>
  </div>;
}

export function FG({label,children}){
  return <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:10}}>
    <label style={{fontSize:13,color:"#475569",fontWeight:600}}>{label}</label>{children}
  </div>;
}

export function Modal({title,onClose,children}){
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}} onClick={onClose}>
    <div style={{background:"#fff",borderRadius:14,padding:18,width:"100%",maxWidth:360,maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <span style={{fontWeight:700,fontSize:16}}>{title}</span>
        <button style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#64748b"}} onClick={onClose}>✕</button>
      </div>
      {children}
    </div>
  </div>;
}
