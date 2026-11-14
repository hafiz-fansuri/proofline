import {useState} from 'react';
import {ArrowUpRight,BookOpen,ChevronLeft,ChevronRight} from 'lucide-react';

const risks=[
 ['01','Harmful instructions',18,24,'Can a document trick an AI into following harmful instructions?'],
 ['02','Private information',48,12,'How can I stop an AI app from sharing private information?'],
 ['03','Too much control',77,21,'How much control should I give an AI assistant?'],
 ['04','Third-party risks',89,43,'What risks come from the outside tools and services used by an AI app?'],
 ['05','Tampered data',76,64,'What happens if someone changes the information an AI app relies on?'],
 ['06','Excessive use',52,77,'How can I stop an AI app from using too many resources?'],
 ['07','Wrong answers',22,75,'Why can an AI give a confident answer that is wrong?'],
 ['08','Hidden instructions',14,54,'Can people discover the hidden instructions given to an AI?'],
 ['09','Search weaknesses',29,47,'How could an AI app show information to someone who should not see it?'],
 ['10','Unsafe outputs',59,45,'Why should an app check what an AI produces before using it?'],
] as const;
const explanations=['An attacker may try to make an AI ignore its intended task.','An AI app may reveal information that should stay private.','An AI may be allowed to do more than it should.','Outside tools and services can introduce security risks.','Changed or misleading data can affect an AI’s answers.','Too many requests can increase costs or disrupt an app.','An answer can sound convincing and still be incorrect.','Hidden instructions are not a safe place to store secrets.','Search needs safeguards to keep restricted information private.','AI-generated content needs checking before an app acts on it.'];

export function RiskAtlas({sources,onOpen,onAsk,busy=false}:{sources:any[];onOpen:(id:string)=>void;onAsk:(q:string)=>void;busy?:boolean}){
 const [active,setActive]=useState(0);
 const risk=risks[active],source=sources.find(s=>s.id.startsWith('llm'+risk[0]+'_'));
 return <section className="risk-atlas" aria-label="Explore OWASP security risks">
  <div className="atlas-caption"><span>Choose a topic</span><span>OWASP guidance</span></div>
  <div className="atlas-map">
   <svg className="atlas-contours" viewBox="0 0 600 430" preserveAspectRatio="none" aria-hidden="true">
    {Array.from({length:24},(_,i)=><path key={i} d={`M ${-80+i*13} -30 C ${-120+i*16} ${110+i*3}, ${350+i*9} ${-40+i*12}, ${220+i*16} 200 S ${80+i*14} ${310+i*5}, ${330+i*12} 470`}/>)}
    <path className="atlas-selected-path" d={`M 300 193 Q ${Number(risk[2])*6} 200 ${Number(risk[2])*6} ${(16+Number(risk[3])*.72)*4.3}`}/>
    <circle className="atlas-orbit" cx="300" cy="193" r="125"/>
   </svg>
   <div className="atlas-center" aria-hidden="true"><span className="atlas-cross"/><span>OWASP<br/>Top 10</span></div>
   {risks.map((r,i)=><button key={r[0]} className={'atlas-pin '+(i===active?'selected':'')} style={{left:r[2]+'%',top:(16+r[3]*.72)+'%'}} onClick={()=>setActive(i)} aria-label={'Explore '+r[1]} aria-pressed={i===active}><span className="pin-marker">{r[0]}</span><span className="pin-label">{r[1]}</span></button>)}
   <span className="map-note">Select a topic to learn more.</span>
  </div>
  <div className="atlas-entry">
   <div className="atlas-entry-top"><BookOpen size={16}/><span>About this topic</span><div className="atlas-stepper"><button aria-label="Previous topic" onClick={()=>setActive((active+9)%10)}><ChevronLeft size={17}/></button><span>{active+1} / 10</span><button aria-label="Next topic" onClick={()=>setActive((active+1)%10)}><ChevronRight size={17}/></button></div></div>
   <div className="atlas-entry-body"><span className="atlas-entry-number">{risk[0]}</span><div><h2>{risk[1]}</h2><p>{explanations[active]}</p></div></div>
   <div className="atlas-entry-actions"><button disabled={busy} onClick={()=>onAsk(risk[4])}>Ask about this <ArrowUpRight size={16}/></button><button disabled={!source} onClick={()=>source&&onOpen(source.id)}>Read the guide <BookOpen size={15}/></button></div>
  </div>
 </section>;
}
