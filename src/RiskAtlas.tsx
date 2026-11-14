import {useState} from 'react';
import {ArrowUpRight,BookOpen,ChevronLeft,ChevronRight} from 'lucide-react';

const risks=[
 ['01','Prompt injection',18,24,'How can retrieved documents cause indirect prompt injection?'],
 ['02','Sensitive information',48,12,'How can I prevent sensitive information disclosure in model outputs?'],
 ['03','Excessive agency',77,21,'What controls reduce excessive agency in a tool-using assistant?'],
 ['04','Supply chain',89,43,'What supply chain risks come from third party model components?'],
 ['05','Data poisoning',76,64,'How should I protect a RAG system from poisoned documents?'],
 ['06','Unbounded consumption',52,77,'How can quotas reduce unbounded consumption in an AI application?'],
 ['07','Misinformation',22,75,'How can I reduce misinformation in a RAG application?'],
 ['08','Hidden context',14,54,'Why should system prompts not be treated as a secret vault?'],
 ['09','Vector weaknesses',29,47,'How do vector embedding weaknesses affect RAG retrieval?'],
 ['10','Output handling',59,45,'How should model outputs be validated before downstream execution?'],
] as const;

export function RiskAtlas({sources,onOpen,onAsk,busy=false}:{sources:any[];onOpen:(id:string)=>void;onAsk:(q:string)=>void;busy?:boolean}){
 const [active,setActive]=useState(0);
 const risk=risks[active],source=sources.find(s=>s.id.startsWith('llm'+risk[0]+'_'));
 return <section className="risk-atlas" aria-label="Explore OWASP security risks">
  <div className="atlas-caption"><span>Explore the OWASP collection</span><span>2026 edition</span></div>
  <div className="atlas-map">
   <svg className="atlas-contours" viewBox="0 0 600 430" preserveAspectRatio="none" aria-hidden="true">
    {Array.from({length:24},(_,i)=><path key={i} d={`M ${-80+i*13} -30 C ${-120+i*16} ${110+i*3}, ${350+i*9} ${-40+i*12}, ${220+i*16} 200 S ${80+i*14} ${310+i*5}, ${330+i*12} 470`}/>)}
    <path className="atlas-selected-path" d={`M 300 193 Q ${Number(risk[2])*6} 200 ${Number(risk[2])*6} ${(16+Number(risk[3])*.72)*4.3}`}/>
    <circle className="atlas-orbit" cx="300" cy="193" r="125"/>
   </svg>
   <div className="atlas-center" aria-hidden="true"><span className="atlas-cross"/><span>OWASP<br/>Top 10</span></div>
   {risks.map((r,i)=><button key={r[0]} className={'atlas-pin '+(i===active?'selected':'')} style={{left:r[2]+'%',top:(16+r[3]*.72)+'%'}} onClick={()=>setActive(i)} aria-label={'Explore '+r[1]} aria-pressed={i===active}><span className="pin-marker">{r[0]}</span><span className="pin-label">{r[1]}</span></button>)}
   <span className="map-note">Select a risk to follow its source.</span>
  </div>
  <div className="atlas-entry">
   <div className="atlas-entry-top"><BookOpen size={16}/><span>Source preview</span><div className="atlas-stepper"><button aria-label="Previous risk" onClick={()=>setActive((active+9)%10)}><ChevronLeft size={17}/></button><span>{active+1} / 10</span><button aria-label="Next risk" onClick={()=>setActive((active+1)%10)}><ChevronRight size={17}/></button></div></div>
   <div className="atlas-entry-body"><span className="atlas-entry-number">{risk[0]}</span><div><h2>{source?.title.replace(/^LLM\d+:2026\s*/,'')??risk[1]}</h2><p>OWASP guidance, original sources, inspectable evidence.</p></div></div>
   <div className="atlas-entry-actions"><button disabled={busy} onClick={()=>onAsk(risk[4])}>Investigate this risk <ArrowUpRight size={16}/></button><button disabled={!source} onClick={()=>source&&onOpen(source.id)}>Read source <BookOpen size={15}/></button></div>
  </div>
 </section>;
}
