# ChessCure

ChessCure is a React/Vite chess frontend backed by a Flask API and MongoDB. The backend validates each player move, generates the AI response, and stores the game position and move records. Undoing a turn marks its move records as undone rather than deleting them.

## Requirements

- Node.js and npm
- Python 3.10 or newer
- MongoDB Community Server, running locally on port `27017`

## Start MongoDB (PowerShell)

If MongoDB is installed as a Windows service and already running, skip this step. Otherwise, open a terminal:

```powershell
Set-Location "C:\Users\tejasri manoj\OneDrive\Desktop\ChessCure-1\backend"
mongod --dbpath ".\data\db" --bind_ip 127.0.0.1 --port 27017
```

Keep that terminal open. MongoDB stores its files in `backend\data\db`.

## Start the backend (PowerShell)

Open a second terminal:

```powershell
Set-Location "C:\Users\tejasri manoj\OneDrive\Desktop\ChessCure-1\backend"
if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env" }
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m scripts.initialize_database
.\.venv\Scripts\python.exe run.py
```

The API listens on `http://127.0.0.1:5000`. Check `http://127.0.0.1:5000/api/health` and `http://127.0.0.1:5000/api/health/database`.

## Start the frontend (PowerShell)

Open a third terminal:

```powershell
Set-Location "C:\Users\tejasri manoj\OneDrive\Desktop\ChessCure-1\frontend"
npm ci
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`). Vite forwards `/api` requests to the Flask backend. When deploying, configure `VITE_API_URL` to the API origin and configure the backend's `FRONTEND_URL` to the deployed frontend origin.

## Stored game data

Games are stored in MongoDB's `chescure_db.games` collection, and each human/AI half-move is stored in `chescure_db.moves`. The frontend keeps the current game ID in browser storage so it can restore the saved position and move history after a reload. To inspect the database:

```powershell
Set-Location "C:\Users\tejasri manoj\OneDrive\Desktop\ChessCure-1\backend"
.\.venv\Scripts\python.exe -m scripts.check_database
```

## Checks

```powershell
Set-Location "C:\Users\tejasri manoj\OneDrive\Desktop\ChessCure-1\frontend"
npm run lint
npm run build

Set-Location "C:\Users\tejasri manoj\OneDrive\Desktop\ChessCure-1\backend"
.\.venv\Scripts\python.exe -m pytest
```
