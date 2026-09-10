const symbols=["☕","🎧","⚡","🌙","🎮","⭐","🍀","🎲","🚀","📷","🎵","🍕","🌈","🏀","🧩","💎"];
const levels={easy:{pairs:8,label:"EASY",hint:"EASY：まずは遊びやすい16枚。"},normal:{pairs:12,label:"NORMAL",hint:"NORMAL：24枚で記憶力アップ。"},hard:{pairs:16,label:"HARD",hint:"HARD：32枚の本格チャレンジ。"}};

const $=id=>document.getElementById(id);
const startScreen=$("startScreen"),gameScreen=$("gameScreen"),board=$("gameBoard"),scoreArea=$("scoreArea"),turnLabel=$("turnLabel"),timeEl=$("time"),movesEl=$("moves"),statusText=$("statusText"),gameTitle=$("gameTitle"),howToModal=$("howToModal"),resultModal=$("resultModal"),resultTitle=$("resultTitle"),resultMessage=$("resultMessage"),resultScores=$("resultScores"),difficultyHint=$("difficultyHint");

let mode="solo",level="easy",deck=[],players=[],turn=0,first=null,second=null,locked=false,moves=0,seconds=0,timer=null,started=false,cpuMemory=new Map();

function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function setupPlayers(){if(mode==="solo")players=[{name:"YOU",score:0,type:"human"}];else if(mode==="cpu")players=[{name:"YOU",score:0,type:"human"},{name:"CPU",score:0,type:"cpu"}];else players=Array.from({length:Number(mode)},(_,i)=>({name:`PLAYER ${i+1}`,score:0,type:"human"}))}
function createDeck(){const list=symbols.slice(0,levels[level].pairs);deck=shuffle(list.flatMap((s,i)=>[{id:`${i}a`,symbol:s,matched:false,flipped:false},{id:`${i}b`,symbol:s,matched:false,flipped:false}]))}
function formatTime(s){return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`}
function startTimer(){if(started)return;started=true;timer=setInterval(()=>{seconds++;timeEl.textContent=formatTime(seconds)},1000)}
function stopTimer(){if(timer)clearInterval(timer);timer=null}
function remember(i){const c=deck[i];if(!c||c.matched)return;if(!cpuMemory.has(c.symbol))cpuMemory.set(c.symbol,new Set());cpuMemory.get(c.symbol).add(i)}
function forget(symbol){cpuMemory.delete(symbol)}

function renderScores(){scoreArea.innerHTML=players.map((p,i)=>`<div class="score-card ${i===turn&&mode!=="solo"?"active":""}"><span>${p.name}</span><strong>${p.score}</strong><small>PAIR</small></div>`).join("")}
function updateUI(){movesEl.textContent=moves;timeEl.textContent=formatTime(seconds);const p=players[turn];turnLabel.textContent=mode==="solo"?"SOLO PLAY":p.type==="cpu"?"CPU TURN":p.name;renderScores()}
function renderBoard(){board.innerHTML="";const cpu=players[turn]?.type==="cpu";deck.forEach((c,i)=>{const b=document.createElement("button");b.type="button";b.className=`card${c.flipped?" flipped":""}${c.matched?" matched":""}`;b.disabled=locked||c.matched||c.flipped||cpu;b.innerHTML=`<span class="card-inner"><span class="card-face card-back"></span><span class="card-face card-front">${c.symbol}</span></span>`;b.addEventListener("click",()=>humanPick(i));board.appendChild(b)})}

function humanPick(i){if(locked||players[turn].type!=="human")return;const c=deck[i];if(c.matched||c.flipped)return;startTimer();c.flipped=true;remember(i);renderBoard();if(first===null){first=i;statusText.textContent="もう1枚めくってみよう。";return}second=i;moves++;updateUI();checkPair()}

function checkPair(){const a=deck[first],b=deck[second],p=players[turn];if(a.symbol===b.symbol){a.matched=b.matched=true;p.score++;forget(a.symbol);first=second=null;statusText.textContent=`${p.name} がペアを獲得！もう一度。`;updateUI();renderBoard();if(deck.every(c=>c.matched)){finish();return}if(p.type==="cpu")setTimeout(cpuTurn,650);return}locked=true;statusText.textContent="ちがう絵柄。次のプレイヤーに交代。";setTimeout(()=>{deck[first].flipped=false;deck[second].flipped=false;first=second=null;locked=false;nextTurn()},800)}

function nextTurn(){turn=(turn+1)%players.length;updateUI();renderBoard();const p=players[turn];if(mode==="solo")statusText.textContent="次の2枚をめくってみよう。";else if(p.type==="cpu"){statusText.textContent="CPUが考えています…";setTimeout(cpuTurn,600)}else statusText.textContent=`${p.name} の番です。`}

function available(){return deck.map((c,i)=>({c,i})).filter(x=>!x.c.matched&&!x.c.flipped).map(x=>x.i)}
function knownPair(){for(const set of cpuMemory.values()){const a=[...set].filter(i=>deck[i]&&!deck[i].matched&&!deck[i].flipped);if(a.length>=2)return a.slice(0,2)}return null}
function skill(){return level==="easy"?.25:level==="normal"?.58:.9}
function chooseCpu(){const a=available();if(a.length<2)return[];const k=knownPair();if(k&&Math.random()<skill())return k;const f=a[Math.floor(Math.random()*a.length)];remember(f);const rest=a.filter(i=>i!==f);const known=cpuMemory.has(deck[f].symbol)?[...cpuMemory.get(deck[f].symbol)].filter(i=>i!==f&&rest.includes(i)&&!deck[i].matched):[];const s=known.length&&Math.random()<skill()?known[Math.floor(Math.random()*known.length)]:rest[Math.floor(Math.random()*rest.length)];return[f,s]}
function cpuTurn(){if(mode!=="cpu"||players[turn].type!=="cpu"||deck.every(c=>c.matched))return;locked=true;statusText.textContent="CPUが考えています…";renderBoard();const [a,b]=chooseCpu();if(a===undefined){locked=false;return}setTimeout(()=>{deck[a].flipped=true;remember(a);first=a;renderBoard();setTimeout(()=>{deck[b].flipped=true;remember(b);second=b;moves++;updateUI();renderBoard();locked=false;setTimeout(checkPair,400)},600)},450)}

function finish(){stopTimer();const max=Math.max(...players.map(p=>p.score)),winners=players.filter(p=>p.score===max);if(mode==="solo"){resultTitle.textContent="CLEAR!";resultMessage.textContent=`${moves}手・${formatTime(seconds)}でクリア！`}else if(winners.length>1){resultTitle.textContent="DRAW";resultMessage.textContent=`${winners.map(p=>p.name).join(" / ")} が同点1位です。`}else if(mode==="cpu"){resultTitle.textContent=winners[0].type==="human"?"YOU WIN!":"CPU WIN";resultMessage.textContent=winners[0].type==="human"?"CPUより多くのペアを獲得しました。":"今回はCPUの勝ち。もう一度挑戦！"}else{resultTitle.textContent=`${winners[0].name} WIN!`;resultMessage.textContent=`${winners[0].name} が一番多くのペアを獲得しました。`}resultScores.innerHTML=players.map(p=>`<div><span>${p.name}</span><strong>${p.score}</strong><small>PAIR</small></div>`).join("");openModal(resultModal)}

function resetGame(){stopTimer();first=second=null;locked=false;moves=seconds=0;started=false;turn=0;cpuMemory=new Map();setupPlayers();createDeck();const modeName=mode==="solo"?"SOLO":mode==="cpu"?"VS CPU":`${mode} PLAYERS`;gameTitle.textContent=`${modeName} · ${levels[level].label}`;statusText.textContent=mode==="solo"?"カードを2枚めくって、同じ絵柄を探してね。":`${players[0].name} からスタート！`;updateUI();renderBoard()}
function startGame(){startScreen.classList.add("hidden");gameScreen.classList.remove("hidden");closeModal(resultModal);resetGame()}
function menu(){stopTimer();closeModal(resultModal);gameScreen.classList.add("hidden");startScreen.classList.remove("hidden")}
function openModal(m){m.classList.remove("hidden");m.setAttribute("aria-hidden","false")}
function closeModal(m){m.classList.add("hidden");m.setAttribute("aria-hidden","true")}

document.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>{mode=b.dataset.mode;document.querySelectorAll("[data-mode]").forEach(x=>x.classList.remove("selected"));b.classList.add("selected")}));
document.querySelectorAll("[data-level]").forEach(b=>b.addEventListener("click",()=>{level=b.dataset.level;document.querySelectorAll("[data-level]").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");difficultyHint.textContent=levels[level].hint}));
$("startBtn").addEventListener("click",startGame);$("restartBtn").addEventListener("click",resetGame);$("backBtn").addEventListener("click",menu);$("playAgainBtn").addEventListener("click",()=>{closeModal(resultModal);resetGame()});$("menuBtn").addEventListener("click",menu);$("howToBtn").addEventListener("click",()=>openModal(howToModal));$("closeHowToBtn").addEventListener("click",()=>closeModal(howToModal));howToModal.querySelector("[data-close]").addEventListener("click",()=>closeModal(howToModal));

if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(console.log));
