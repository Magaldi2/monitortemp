# MonitorTemp - Sistema de Monitoramento para Cadeia Fria de Vacinas

Este projeto oferece uma solução de baixo custo e alta eficiência para o monitoramento de temperatura em refrigeradores de vacinas, um desafio crítico na **cadeia fria da saúde pública**. Desenvolvido com foco em postos de saúde e clínicas com recursos limitados, o MonitorTemp garante a segurança e a eficácia das vacinas, evitando perdas por armazenamento inadequado.

A solução utiliza um microcontrolador ESP32 para coletar dados, um backend robusto para processar e armazenar essas informações, e um frontend moderno para visualização e gerenciamento de alertas.

## ✨ Funcionalidades

* **Monitoramento Contínuo:** O dispositivo ESP32 lê a temperatura do sensor DS18B20 e a envia para o servidor em intervalos regulares, garantindo vigilância constante.
* **Alertas Críticos por E-mail:** Envio imediato de notificações quando a temperatura ultrapassa os **8°C**, um limite crítico para a conservação de muitas vacinas, permitindo ação rápida para evitar perdas.
* **Dashboard Web Intuitivo:** Uma interface web moderna exibe os dados de temperatura de forma clara, permitindo que a equipe de saúde verifique o status dos refrigeradores rapidamente.
* **Visualização de Dados Históricos:** Gráficos dinâmicos permitem analisar o histórico de temperaturas, auxiliando na identificação de padrões ou falhas no equipamento.
* **Gerenciamento de Destinatários:** É possível adicionar e remover facilmente os e-mails dos responsáveis que receberão os alertas, tudo através da interface web.
* **Suporte a Múltiplos Dispositivos:** A arquitetura foi pensada para monitorar múltiplos refrigeradores ("Monitores") de forma centralizada.
* **Implantação Simplificada com Docker:** O backend e o frontend podem ser facilmente implantados usando Docker, garantindo consistência e facilidade na instalação.

## 🛠️ Tecnologias Utilizadas

O projeto é dividido em três componentes principais:

### 1. Firmware (Dispositivo de Monitoramento)

* **Microcontrolador:** ESP32-DoIt-DevKit-V1.
* **Framework:** Arduino.
* **Sensor de Temperatura:** DS18B20.
* **Bibliotecas Principais:**
    * `DallasTemperature` & `OneWire`: Para comunicação com o sensor.
    * `ESP Mail Client`: Para o envio de e-mails de alerta.
    * `ArduinoJson`: Para manipulação de dados em formato JSON.
    * `HTTPClient`: Para comunicação com o backend.

### 2. Backend (Servidor de Dados)

* **Linguagem:** Python.
* **Framework:** FastAPI.
* **Banco de Dados:** SQLite, com ORM via SQLAlchemy.
* **Servidor:** Uvicorn.

### 3. Frontend (Dashboard de Visualização)

* **Framework:** Next.js.
* **Linguagem:** TypeScript & React.
* **UI Kit:** Material-UI (MUI).
* **Gráficos:** Chart.js.
* **Comunicação com API:** Axios.

## 📂 Estrutura do Projeto

```
/
├── backend/                # Aplicação FastAPI (Python)
├── frontend/               # Aplicação Next.js (TypeScript)
├── lib/
│   └── mail/               # Biblioteca customizada para envio de e-mail
├── src/
│   └── main.cpp            # Código principal do ESP32
├── docker-compose.yml      # Arquivo para orquestração com Docker
└── platformio.ini          # Configuração do projeto PlatformIO
```

## 🚀 Como Executar

### Método 1: Usando Docker (Recomendado)

1.  **Pré-requisitos:** Docker e Docker Compose.
2.  **Execução:** Na raiz do projeto, execute o comando:
    ```bash
    docker-compose up -d --build
    ```
    * O frontend estará acessível em `http://localhost:3000`.
    * O backend estará acessível em `http://localhost:8000`.

### Método 2: Instalação Manual

#### 1. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```



#### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```


O dashboard estará disponível em `http://localhost:3000`.

#### 3. Firmware (ESP32)

1.  **Pré-requisitos:** VS Code com a extensão PlatformIO IDE.
2.  **Configuração:**
    * Abra o arquivo `src/main.cpp`.
    * Preencha as credenciais da sua rede Wi-Fi nas variáveis `ssid` e `password`.
    * Atualize a variável `serverHost` com o endereço IP do seu backend.
    * **Limite de Temperatura para Alerta:** No mesmo arquivo (`src/main.cpp`), o limite de temperatura para envio de alertas está definido como `8.0°C`. Este valor pode ser ajustado conforme a necessidade específica das vacinas armazenadas.
3.  **Upload:** Conecte o ESP32, abra o projeto no PlatformIO e clique em "Upload".
