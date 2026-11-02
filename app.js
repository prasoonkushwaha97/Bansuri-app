const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const notes=["सा","रे","ग","म","प","ध","नि"];
const freqs=[261.63,293.66,329.63,349.23,392,440,493.88];
const melodies=[
{id:"m1",title:"रघुपति राघव",category:"भजन",tag:"भक्ति",duration:"1:05",notes:[0,2,4,4,5,4,2,0,2,4,5,4,2,0]},
{id:"m2",title:"वैष्णव जन",category:"भजन",tag:"शांत",duration:"0:58",notes:[2,2,3,4,4,3,2,1,0,1,2,3,2,1,0]},
{id:"m3",title:"हरे कृष्ण महामंत्र",category:"भजन",tag:"भक्ति",duration:"0:52",notes:[4,4,5,4,2,2,4,4,5,4,2,2,0,2,4]},
{id:"m4",title:"सुबह की बाँसुरी",category:"शांत",tag:"मेडिटेशन",duration:"0:45",notes:[0,2,4,5,4,2,0,2,3,2,0]},
{id:"m5",title:"चाँदनी धुन",category:"गीत",tag:"मौलिक धुन",duration:"0:48",notes:[0,2,3,5,4,3,2,0,2,4,5,6,5,4,2]},
{id:"m6",title:"सावन की फुहार",category:"गीत",tag:"मौलिक धुन",duration:"0:50",notes:[4,3,2,0,2,3,4,5,4,2,1,0]}
];
let audioCtx=null,activeOsc=[],timer=null,playing=false,queue=[],queueIndex=0,step=0,filter="सभी",octave=0;
function audio(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==="suspended")audioCtx.resume();return audioCtx}
function playTone(index,duration=.38){const ctx=audio(),freq=freqs[index%7]*Math.pow(2,octave);const osc=ctx.createOscillator(),gain=ctx.createGain(),filterNode=ctx.createBiquadFilter();osc.type="sine";osc.frequency.value=freq;filterNode.type="lowpass";filterNode.frequency.value=$("#tone")?.value==="bright"?2400:1400;gain.gain.setValueAtTime(.0001,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.20,ctx.currentTime+.04);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);osc.connect(filterNode);filterNode.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+duration+.03);activeOsc.push(osc);osc.onended=()=>activeOsc=activeOsc.filter(x=>x!==osc)}
function stop(){clearInterval(timer);timer=null;playing=false;activeOsc.forEach(o=>{try{o.stop()}catch(e){}});activeOsc=[];$("#playPause").textContent="▶";$("#progressBar").style.width="0%"}
function startSong(song){stop();queue=song.notes;queueIndex=0;step=0;$("#player").classList.remove("hidden");$("#playerTitle").textContent=song.title;$("#playerCategory").textContent=song.category+" · बाँसुरी";playing=true;$("#playPause").textContent="Ⅱ";playSequence()}
function playSequence(){if(!playing)return;if(queueIndex>=queue.length){stop();return}playTone(queue[queueIndex],.42);queueIndex++;$("#progressBar").style.width=(queueIndex/queue.length*100)+"%";timer=setTimeout(playSequence,470)}
function togglePlayback(){if(!queue.length)return;if(playing){clearTimeout(timer);playing=false;$("#playPause").textContent="▶"}else{playing=true;$("#playPause").textContent="Ⅱ";playSequence()}}
function songRow(s){return `<div class="song-row"><div class="song-cover">♫</div><div class="song-meta"><b>${s.title}</b><small>${s.category} · ${s.tag||"मेरी धुन"} · ${s.duration||"स्वयं की धुन"}</small></div><button class="song-play" data-song="${s.id}" aria-label="${s.title} चलाएँ">▶</button></div>`}
function render(){const featured=melodies.slice(0,3);$("#featured").innerHTML=featured.map(songRow).join("");const q=($("#search")?.value||"").toLowerCase();const filtered=melodies.filter(s=>(filter==="सभी"||s.category===filter||s.tag===filter)&&(s.title+s.category+s.tag).toLowerCase().includes(q));$("#librarySongs").innerHTML=filtered.length?filtered.map(songRow).join(""):"<p class='muted'>कोई धुन नहीं मिली।</p>";const mine=JSON.parse(localStorage.getItem("myBansuriTunes")||"[]");$("#mySongs").innerHTML=mine.length?mine.map(songRow).join(""):"<p class='muted'>अभी कोई धुन सेव नहीं है। ऊपर अपनी पहली धुन बनाएँ।</p>";}
function toast(t){const el=$("#toast");el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2200)}
function showTab(name){$$(".view").forEach(v=>v.classList.toggle("active",v.id===name));$$(".tab").forEach(t=>t.classList.toggle("active",t.dataset.tab===name));window.scrollTo({top:0,behavior:"smooth"})}
document.addEventListener("click",e=>{const tab=e.target.closest("[data-tab]");if(tab)showTab(tab.dataset.tab);const filterBtn=e.target.closest("[data-filter]");if(filterBtn){filter=filterBtn.dataset.filter;$$(".filter").forEach(b=>b.classList.toggle("active",b.dataset.filter===filter));showTab("library");render()}const songBtn=e.target.closest("[data-song]");if(songBtn){const all=[...melodies,...JSON.parse(localStorage.getItem("myBansuriTunes")||"[]")];const song=all.find(s=>s.id===songBtn.dataset.song);if(song)startSong(song)}});
$$(".filter").forEach(b=>b.addEventListener("click",()=>{filter=b.dataset.filter;$$(".filter").forEach(x=>x.classList.toggle("active",x===b));render()}));
$("#search").addEventListener("input",render);
$("#octave").addEventListener("change",e=>octave=Number(e.target.value));
$("#playPause").addEventListener("click",togglePlayback);
$("#stopNote").addEventListener("click",stop);
$("#prevSong").addEventListener("click",()=>{if(queue.length){queueIndex=0;stop();playing=true;playSequence()}});
$("#nextSong").addEventListener("click",()=>{if(queue.length){queueIndex=0;playing=true;clearTimeout(timer);playSequence()}});
const holes=$$(".hole");holes.forEach((h,i)=>{const down=e=>{e.preventDefault();audio();h.classList.add("active");$("#currentNote").textContent=notes[i];playTone(i,.8)};const up=()=>h.classList.remove("active");h.addEventListener("pointerdown",down);h.addEventListener("pointerup",up);h.addEventListener("pointerleave",up);h.addEventListener("pointercancel",up)});
$("#saveMelody").addEventListener("click",()=>{const name=$("#melodyName").value.trim(),raw=$("#melodyNotes").value.trim();if(!name||!raw){toast("नाम और स्वर दोनों लिखें।");return}const map={"सा":0,"रे":1,"ग":2,"म":3,"प":4,"ध":5,"नि":6};const parsed=raw.split(/[\s,|]+/).filter(Boolean).map(n=>map[n]);if(parsed.length<2||parsed.some(n=>n===undefined)){toast("स्वर सही क्रम में लिखें: सा रे ग म");return}const mine=JSON.parse(localStorage.getItem("myBansuriTunes")||"[]");mine.push({id:"u"+Date.now(),title:name,category:"मेरी धुन",tag:"आपकी रचना",duration:"कस्टम",notes:parsed});localStorage.setItem("myBansuriTunes",JSON.stringify(mine));$("#melodyName").value="";$("#melodyNotes").value="";render();toast("आपकी धुन सेव हो गई।")});
$("#soundToggle").addEventListener("click",()=>toast("आवाज़ बदलने के लिए बजाएँ स्क्रीन के विकल्प देखें।"));
render();
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
