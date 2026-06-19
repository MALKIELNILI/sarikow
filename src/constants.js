export const MONTHS_HE = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
export const trackLabel = { "2000":"2,000 ₪", "1000":"1,000 ₪" };
export const trackColor = { "2000":"#2563eb", "1000":"#7c3aed" };
export const groupLabel = { datot:"זכאי דתות", keren:"מושהה קרן" };
export const groupColor = { datot:"#b45309", keren:"#059669" };

export const defaultAvrechim = [
  {id:6,  name:"יונתן עובדיה",  track:"1000", maxStipend:2000, active:true, incomeGroup:"datot"},
  {id:9,  name:"חזקיה כהן",     track:"2000", maxStipend:2000, active:true, incomeGroup:"datot"},
  {id:8,  name:"מאיר חאלו",     track:"2000", maxStipend:4300, active:true, incomeGroup:"datot"},
  {id:1,  name:"עמנואל חיימוב", track:"1000", maxStipend:2000, active:true, incomeGroup:"datot"},
  {id:2,  name:"משה קוסיוב",    track:"1000", maxStipend:2000, active:true, incomeGroup:"datot"},
  {id:3,  name:"יהודה יגודיוב", track:"1000", maxStipend:2000, active:true, incomeGroup:"datot"},
  {id:4,  name:"אליהו רדעאי",   track:"1000", maxStipend:2000, active:true, incomeGroup:"datot"},
  {id:15, name:"אברהם אליאב",   track:"1000", maxStipend:2000, active:true, incomeGroup:"keren"},
  {id:14, name:"אוראל",         track:"1000", maxStipend:2000, active:true, incomeGroup:"keren"},
  {id:10, name:"אביתר אבייב",   track:"1000", maxStipend:2000, active:true, incomeGroup:"keren"},
  {id:11, name:"אלחנן יצחקוב",  track:"1000", maxStipend:2000, active:true, incomeGroup:"keren"},
  {id:12, name:"דניאל יוסופוב", track:"1000", maxStipend:2000, active:true, incomeGroup:"keren"},
  {id:13, name:"רפאל חיימוב",   track:"1000", maxStipend:2000, active:true, incomeGroup:"keren"},
  {id:5,  name:"אוריאל",        track:"1000", maxStipend:2000, active:true, incomeGroup:"datot"},
  {id:7,  name:"מאור עובדיה",   track:"2000", maxStipend:2600, active:true, incomeGroup:"datot"},
];

export const BEIN_HAZMANIM = [
  { from:"2025-09-21", to:"2025-10-15", label:"בין הזמנים תשרי תשפ״ו" },
  { from:"2026-03-29", to:"2026-04-17", label:"בין הזמנים פסח תשפ״ו" },
  { from:"2026-07-25", to:"2026-08-23", label:"בין הזמנים קיץ תשפ״ו" },
  { from:"2026-10-11", to:"2026-11-03", label:"בין הזמנים תשרי תשפ״ז" },
  { from:"2027-04-19", to:"2027-04-30", label:"בין הזמנים פסח תשפ״ז" },
];

export const HOLIDAYS_DB = [
  { date:"2025-09-22", label:"ראש השנה" }, { date:"2025-09-23", label:"ראש השנה" },
  { date:"2025-10-01", label:"יום כיפור" },
  { date:"2025-10-06", label:"סוכות" },    { date:"2025-10-07", label:"סוכות" },
  { date:"2025-10-13", label:"שמיני עצרת"}, { date:"2025-10-14", label:"שמחת תורה" },
  { from:"2025-12-14", to:"2025-12-22",   label:"חנוכה תשפ״ו" },
  { date:"2026-01-13", label:"ט׳ בטבת" },
  { date:"2026-03-13", label:"פורים" },    { date:"2026-03-14", label:"שושן פורים" },
  { date:"2026-04-01", label:"פסח" },      { date:"2026-04-02", label:"פסח" },
  { date:"2026-04-07", label:"שביעי של פסח" }, { date:"2026-04-08", label:"אחרון של פסח" },
  { date:"2026-04-21", label:"יום הזיכרון" }, { date:"2026-04-22", label:"יום העצמאות" },
  { date:"2026-05-05", label:"ל״ג בעומר" },
  { date:"2026-05-21", label:"שבועות" },   { date:"2026-05-22", label:"שבועות" },
  { from:"2027-01-02", to:"2027-01-10",   label:"חנוכה תשפ״ז" },
  { date:"2027-03-02", label:"פורים" },
  { date:"2027-04-20", label:"פסח" },      { date:"2027-04-26", label:"שביעי של פסח" },
];

export const mkMonthKey = (y, m) => `${y}-${String(m+1).padStart(2,'0')}`;
export const mkMonthLabel = (y, m) => `${MONTHS_HE[m]} ${y}`;
export const emptyMonthData = () => ({ donors:[], datot:0, keren:0, datotConfirmed:0, kerenConfirmed:0, sent2000:0, sent1000:0, sentKeren:0, adjustment:0, adjustmentNote:"" });
