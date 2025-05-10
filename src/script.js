const connStatusEl = document.getElementById('connection-status');
const dataStatusEl = document.getElementById('data-status');
const needle        = document.getElementById('compass-needle');
const dirText       = document.getElementById('direcao');
let dataTimer;

function markDataReceived() {
  clearTimeout(dataTimer);
  dataStatusEl.textContent = 'Recebendo';
  dataStatusEl.className = 'status connected';
  dataTimer = setTimeout(() => {
    dataStatusEl.textContent = 'Sem dados';
    dataStatusEl.className = 'status disconnected';
    setDot();
  }, 3000);
}

function setDot() {
  needle.className = 'needle dot';
  needle.style.transform = 'translate(-50%, -50%)';
}

function setNeedle(angle) {
  needle.className = 'needle line';
  // Base da linha no centro; -100% move a ponta para fora
  needle.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
}

const socket = new WebSocket('wss://iotserver-embarcatech-production.up.railway.app');

socket.onopen = () => {
  connStatusEl.textContent = 'Servidor: Conectado';
  connStatusEl.className = 'status connected';
};

socket.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    markDataReceived();

    // Joystick (swap de eixos)
    const rawX = data.eixo_x;  // controla vertical
    const rawY = data.eixo_y;  // controla horizontal
    const box       = document.querySelector('.joystick-box');
    const indicator = document.getElementById('joystick-indicator');
    const boxSize = box.clientWidth;
    const indicatorSize = indicator.offsetWidth;
    const maxOffset = (boxSize - indicatorSize) / 2;

    const normX = ((rawY - 2048) / 2048) * maxOffset;
    const normY = -((rawX - 2048) / 2048) * maxOffset;

    indicator.style.transform = `translate(${normX}px, ${normY}px)`;

    document.getElementById('eixo_x').textContent = rawX;
    document.getElementById('eixo_y').textContent = rawY;

    // Botões
    const btn1 = document.getElementById('btn1-indicator');
    const btn2 = document.getElementById('btn2-indicator');
    btn1.style.background = data.botao_1 === 'Pressionado' ? '#27ae60' : '#bbb';
    btn2.style.background = data.botao_2 === 'Pressionado' ? '#27ae60' : '#bbb';
    btn1.style.filter = data.botao_1 === 'Pressionado' ? 'drop-shadow(0 2px 6px #27ae60)' : '';
    btn2.style.filter = data.botao_2 === 'Pressionado' ? 'drop-shadow(0 2px 6px #27ae60)' : '';


    // Distância HC-SR04
    const dist    = data['hc-sr04'];
    const percent = Math.min((dist / 80) * 100, 100);
    document.getElementById('hc_sr04').textContent       = dist.toFixed(2);
    document.getElementById('hc-bar-fill').style.width   = percent + '%';

    // Rosa dos ventos (mesmo swap)
    dirText.textContent = data.direcao;
    const dx = -(rawY - 2048);            // eixo leste-oeste
    const dy = rawX - 2048;               // eixo norte-sul (positivo norte)
    const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
    const magnitude = Math.hypot(dx, dy);

    if (magnitude < 100) {
      setDot();
    } else {
      // -90 para alinhar 0° com Norte
      setNeedle(angle - 90);
    }

  } catch (err) {
    console.error('Erro ao processar dado:', err);
  }
};

socket.onclose = () => {
  connStatusEl.textContent = 'WiFi: Desconectado';
  connStatusEl.className = 'status disconnected';
  clearTimeout(dataTimer);
  dataStatusEl.textContent = 'Sem dados';
  dataStatusEl.className = 'status disconnected';
  setDot();
};
