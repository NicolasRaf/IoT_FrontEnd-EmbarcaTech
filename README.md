# 📡 IoT Dashboard Frontend - EmbarcaTech

Este projeto é um **dashboard web** para monitoramento de dados IoT vindos de um WebSocket. Ele exibe:

- 🔄 **Status de conexão** (Servidor/WebSocket)
- 📊 **Status de dados** (Recebendo / Sem dados)
- 🎮 **Indicador de joystick** (ponto móvel dentro de uma área)
- 🔴🔵 **Status dos botões** (LEDs que mudam de cor)
- 📏 **Leitura do sensor HC-SR04** (barra de progresso)
- 🧭 **Rosa dos Ventos dinâmica** (agulha que aponta conforme o joystick)

 [Acesse o site aqui!](https://iotdashboard.embarcatech.com/) 🚀

## 📁 Estrutura de Arquivos

````bash
/
├── index.html
├── README.md
└── src
  ├── styles.css
  └── script.js

````

- **index.html**: marcação principal do dashboard.
- **src/styles.css**: estilos de layout, indicadores e rosa dos ventos.
- **src/script.js**: lógica de conexão WebSocket e atualização dos componentes.

## 🛠 Detalhes de implementação

### 1. Conexão WebSocket

```js
const socket = new WebSocket('wss://iotserver-embarcatech-production.up.railway.app');

socket.onopen = () => { /* exibe “Servidor: Conectado” */ };
socket.onmessage = event => { /* parse JSON e atualiza UI */ };
socket.onclose = () => { /* exibe “Desconectado” e reseta dot */ };
```

### 2. Status de dados

- Ao receber mensagem:

  ```js
  dataStatusEl.textContent = 'Recebendo';
  ```
  
- Se passar 3 s sem nova mensagem:

  ```js
  dataStatusEl.textContent = 'Sem dados';
  setDot();
  ```

### 3. Indicador de joystick

- Ponto central (`.joystick-box`) de tamanho fixo.
- Movimento cartográfico com **swap de eixos** (rawY → X, rawX → Y invertido).
- Cálculo respeita tamanho do indicador para não ultrapassar bordas:

  ```js
  const maxOffset = (boxSize - indicatorSize) / 2;
  const normX = ((rawY - 2048) / 2048) * maxOffset;
  const normY = -((rawX - 2048) / 2048) * maxOffset;
  ```

### 4. Status dos botões

```js
btn1.style.background = data.botao_1 === 'Pressionado' ? '#27ae60' : '#bbb';
btn2.style.background = data.botao_2 === 'Pressionado' ? '#27ae60' : '#bbb';
```

### 5. Barra de progresso HC-SR04

- Distância normalizada para 0–100 % (limite 80 cm):

  ```js
  const percent = Math.min((dist / 80) * 100, 100);
  hcBarFill.style.width = percent + '%';
  ```

### 6. Rosa dos Ventos

- Círculo e marcadores CSS puros (N, L, S, O).
- Ponto central ou agulha rotativa conforme magnitude:

  ```js
  const dx = -(rawY - 2048);
  const dy = rawX - 2048;
  const angle = (Math.atan2(dy, dx) * 180/Math.PI + 360) % 360;
  if (magnitude < 100) setDot();
  else setNeedle(angle - 90);
  ```

---

## 🎨 Personalização

- **Cores**, **tamanhos** e **texturas** podem ser ajustados em `styles.css`.
- Para trocar o limite de “centralidade” do joystick/rosa, altere o valor de `magnitude < 100` no script.
- Se quiser trocar o endpoint WebSocket, edite apenas a URL na criação do `new WebSocket(...)`.

---

**Desenvolvido por [Nícolas Rafael](https://github.com/NicolasRaf)🚀**
