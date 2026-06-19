import { BEIN_HAZMANIM, HOLIDAYS_DB } from "./constants.js";

export const fmt = n => Number(n||0).toLocaleString("he-IL",{minimumFractionDigits:0,maximumFractionDigits:0});
export const fmtSigned = n => (n>0?"+":"")+fmt(n);

export function getDayType(dateStr, customVacations, bzList, hiddenHols) {
  const date = new Date(dateStr + "T12:00:00");
  const dow = date.getDay();
  if (dow === 6) return { type:"shabbat",      label:"שבת" };
  if (dow === 5) return { type:"friday",       label:"שישי" };
  if (customVacations?.[dateStr]) return { type:"vacation", label:customVacations[dateStr] };
  for (const bh of (bzList||BEIN_HAZMANIM)) {
    if (dateStr >= bh.from && dateStr <= bh.to) return { type:"bein_hazmanim", label:bh.label };
  }
  for (const h of HOLIDAYS_DB) {
    if (hiddenHols?.includes(h.label)) continue;
    if (h.date === dateStr) return { type:"holiday", label:h.label };
    if (h.from && dateStr >= h.from && dateStr <= h.to) return { type:"holiday", label:h.label };
  }
  return { type:"learning", label:"" };
}

export function getMonthWeeks(year, month) {
  const weeks = [];
  const lastDay = new Date(year, month + 1, 0);
  let current = new Date(year, month, 1);
  while (current.getDay() !== 0) current.setDate(current.getDate() - 1);
  while (current <= lastDay) {
    const week = [];
    for (let d = 0; d < 5; d++) {
      const y=current.getFullYear(), mo=current.getMonth(), da=current.getDate();
      const dateStr=`${y}-${String(mo+1).padStart(2,"0")}-${String(da).padStart(2,"0")}`;
      week.push({ dateStr, dayNum:da, inMonth:mo===month });
      current.setDate(current.getDate() + 1);
    }
    current.setDate(current.getDate() + 2); // skip Fri+Sat
    if (week.some(d => d.inMonth)) weeks.push(week);
  }
  return weeks;
}

// ── HEBREW DATE HELPERS ──────────────────────────────────────
const _hMonthFmt = new Intl.DateTimeFormat("he-u-ca-hebrew",  { month:"long", year:"numeric" });
const _hDayNumFmt= new Intl.DateTimeFormat("en-u-ca-hebrew",  { day:"numeric" }); // returns Arabic numeral
const _hMonthOnly= new Intl.DateTimeFormat("he-u-ca-hebrew",  { month:"long" });

export const HEB_LETTERS = ["","א","ב","ג","ד","ה","ו","ז","ח","ט","י","יא","יב","יג","יד","טו","טז","יז","יח","יט","כ","כא","כב","כג","כד","כה","כו","כז","כח","כט","ל"];

const _hDayNum = dateStr => { try { return parseInt(_hDayNumFmt.format(new Date(dateStr+"T12:00:00")),10); } catch(e){ return 0; } };
export const toHebrewDay   = dateStr => { const n=_hDayNum(dateStr); return HEB_LETTERS[n]||String(n); };
export const toHebrewMonth = dateStr => { try { return _hMonthFmt.format(new Date(dateStr+"T12:00:00")); } catch(e){ return ""; } };
export const toFullHebDate = dateStr => { try { const d=new Date(dateStr+"T12:00:00"); return `${HEB_LETTERS[_hDayNum(dateStr)]||""} ${_hMonthOnly.format(d)}`; } catch(e){ return dateStr; } };

export const HEB_MONTHS = ["תשרי","חשון","כסלו","טבת","שבט","אדר","ניסן","אייר","סיון","תמוז","אב","אלול"];
const HEB_MONTH_EN = { "תשרי":"Tishri","חשון":"Heshvan","כסלו":"Kislev","טבת":"Tevet","שבט":"Shevat","אדר":"Adar","ניסן":"Nisan","אייר":"Iyar","סיון":"Sivan","תמוז":"Tamuz","אב":"Av","אלול":"Elul" };
const _hebFmt = new Intl.DateTimeFormat("en-US-u-ca-hebrew", { year:"numeric", month:"short", day:"numeric" });
const _hebMonthStartCache = {};

function _scanHebYear(hebYear){
  const gy = hebYear - 3761;
  let d = new Date(Date.UTC(gy, 7, 1));
  const end = new Date(Date.UTC(gy+1, 10, 15));
  while(d<=end){
    const parts=_hebFmt.formatToParts(d);
    const mEn=parts.find(p=>p.type==="month").value;
    const day=Number(parts.find(p=>p.type==="day").value);
    const yr=Number(parts.find(p=>p.type==="year").value);
    if(yr===hebYear && day===1){
      const ds=`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`;
      _hebMonthStartCache[hebYear+"|"+mEn]=ds;
    }
    d.setUTCDate(d.getUTCDate()+1);
  }
}

function _hebMonthStart(hebYear, monthHeb){
  if(!_hebMonthStartCache[hebYear+"|Tishri"]) _scanHebYear(hebYear);
  let monthEn = HEB_MONTH_EN[monthHeb];
  if(monthEn==="Adar" && _hebMonthStartCache[hebYear+"|Adar II"]) monthEn="Adar II";
  return _hebMonthStartCache[hebYear+"|"+monthEn]||null;
}

export const hebToGreg = (year, month, day) => {
  const start = _hebMonthStart(year, month);
  if(!start) return null;
  const d = new Date(start+"T12:00:00");
  d.setDate(d.getDate()+day-1);
  const y=d.getFullYear(), m=d.getMonth()+1, da=d.getDate();
  return `${y}-${String(m).padStart(2,"0")}-${String(da).padStart(2,"0")}`;
};

export const hebMonthDays = (year, month) => {
  const idx = HEB_MONTHS.indexOf(month);
  const cur = hebToGreg(year, month, 1);
  const next = idx<HEB_MONTHS.length-1 ? hebToGreg(year, HEB_MONTHS[idx+1], 1) : hebToGreg(year+1, HEB_MONTHS[0], 1);
  if(!cur||!next) return 29;
  const diff = Math.round((new Date(next+"T12:00:00") - new Date(cur+"T12:00:00"))/86400000);
  return diff>0?diff:29;
};

const _GEMATRIA=[[400,"ת"],[300,"ש"],[200,"ר"],[100,"ק"],[90,"צ"],[80,"פ"],[70,"ע"],[60,"ס"],[50,"נ"],[40,"מ"],[30,"ל"],[20,"כ"],[10,"י"],[9,"ט"],[8,"ח"],[7,"ז"],[6,"ו"],[5,"ה"],[4,"ד"],[3,"ג"],[2,"ב"],[1,"א"]];
export function hebYearLabel(y){
  const n=y%1000, letters=[];
  let h=Math.floor(n/100)*100, rest=n%100;
  for(const [v,l] of _GEMATRIA){ if(v>=100){ while(h>=v){letters.push(l);h-=v;} } }
  if(rest===15) letters.push("ט","ו");
  else if(rest===16) letters.push("ט","ז");
  else { let r=rest; for(const [v,l] of _GEMATRIA){ if(v<100){ while(r>=v){letters.push(l);r-=v;} } } }
  if(letters.length<=1) return (letters[0]||"")+"׳";
  return letters.slice(0,-1).join("")+"״"+letters[letters.length-1];
}

export const _curHebYear = Number((new Intl.DateTimeFormat("en-US-u-ca-hebrew",{year:"numeric"}).format(new Date()).match(/\d+/)||[])[0]) || 5786;
export const HEB_YEARS = Array.from({length:5},(_,i)=>_curHebYear-1+i);
