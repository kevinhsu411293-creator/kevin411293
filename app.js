// ===== Firebase 初始化 =====
const firebaseConfig = {
  apiKey: "AIzaSyB1E-gzwiwK0Jk6MrqsO6V_FL8LirJwp8M",
  authDomain: "diceforge-587fb.firebaseapp.com",
  databaseURL: "https://diceforge-587fb-default-rtdb.firebaseio.com",
  projectId: "diceforge-587fb",
  storageBucket: "diceforge-587fb.firebasestorage.app",
  messagingSenderId: "772019764424",
  appId: "1:772019764424:web:64727bf3f2264cad2fb9fd"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ===== 變數 =====
const roomId = "room123";  // 可改成隨機或 UI 選擇
let playerId = null;
let playerName = "";
let playersRef = db.ref(`rooms/${roomId}/players`);
let turnRef = db.ref(`rooms/${roomId}/turn`);

// ===== DOM 元素 =====
const playerInput = document.getElementById("playerName");
const joinBtn = document.getElementById("joinBtn");
const gameArea = document.getElementById("gameArea");
const playersList = document.getElementById("playersList");
const turnInfo = document.getElementById("turnInfo");
const rollBtn = document.getElementById("rollBtn");

// ===== 加入房間 =====
joinBtn.addEventListener("click", () => {
  playerName = playerInput.value.trim();
  if(!playerName) return alert("請輸入名字");

  playerId = "player_" + Date.now(); // 簡單唯一 ID
  playersRef.child(playerId).set({
    name: playerName,
    dice: ["?", "?"]
  });

  gameArea.style.display = "block";
  joinBtn.disabled = true;
  playerInput.disabled = true;

  // 訂閱玩家列表
  playersRef.on("value", snapshot => {
    const players = snapshot.val() || {};
    playersList.innerHTML = "";
    for(const id in players){
      const p = players[id];
      playersList.innerHTML += `<li>${p.name} 🎲 ${p.dice[0]} ${p.dice[1]}</li>`;
    }
  });

  // 訂閱回合
  turnRef.on("value", snapshot => {
    const turnId = snapshot.val();
    if(!turnId){
      // 沒有回合，設定第一個玩家
      turnRef.set(playerId);
      return;
    }
    if(turnId === playerId){
      turnInfo.textContent = "輪到你擲骰子";
      rollBtn.disabled = false;
    }else{
      const turnPlayer = document.querySelector(`#playersList li:nth-child(1)`)?.textContent || "";
      turnInfo.textContent = `輪到其他玩家擲骰子`;
      rollBtn.disabled = true;
    }
  });
});

// ===== 擲骰子 =====
rollBtn.addEventListener("click", () => {
  const dice1 = Math.floor(Math.random()*6)+1;
  const dice2 = Math.floor(Math.random()*6)+1;
  playersRef.child(playerId).update({
    dice: [dice1, dice2]
  });

  // 更新下一個回合
  playersRef.once("value").then(snapshot => {
    const keys = Object.keys(snapshot.val() || {});
    const currentIndex = keys.indexOf(playerId);
    const nextIndex = (currentIndex + 1) % keys.length;
    turnRef.set(keys[nextIndex]);
  });
});
