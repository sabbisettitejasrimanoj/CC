# ChessCure Repair Notes

This file explains the main problems that were repaired and the ideas behind
the fixes.

## 1. React context must have one consistent contract

`GameContextValue`, the object passed to `GameContext.Provider`, and every
component that calls `useGame()` must use the same property names and types.
The broken version referenced values such as `retryAiMove`, `startNewGame`,
`isBusy`, and `gameId` without defining or exposing them consistently.

The repaired `GameContext.tsx` now:

- imports `PieceStyle`, API types, API functions, and sound functions;
- declares every value in `GameContextValue`;
- creates every function before adding it to the provider value;
- keeps the local chess.js position synchronized with the backend FEN;
- submits the human move first and then requests the AI response;
- restores saved games and supports undo without deleting database history;
- reports backend failures through `apiError` instead of crashing React.

## 2. TypeScript checking is separate from a Vite build

Vite can produce a bundle even when editor type errors exist. Run both:

```powershell
npx tsc --noEmit
npm run lint
npm run build
```

## 3. Frontend and backend response types must agree

`gameApi.ts` now describes secret-chat state and significant-move trigger data
returned by Flask. Its default API origin is `http://127.0.0.1:5000`, while
`.env.example` documents configurable API and Socket.IO URLs.

## 4. Use one Socket.IO instance

The shared instance lives in `backend/app/extensions.py`. The Flask factory
initializes that instance and imports realtime handlers only after extensions
are ready. Creating separate Socket.IO objects causes handlers to register on
one object while `run.py` starts another.

## 5. Keep backend routes internally consistent

The AI route previously called an undefined user helper. The repaired route
uses the game document consistently, serializes an AI `player_id` as `null`,
and emits `secret_chat_opened` after a significant human move.

The missing undo endpoint now marks moves as `undone` and restores the game
position. It preserves records for auditing instead of deleting them.

## 6. Requirements files must be UTF-8

The original backend requirements file was UTF-16 and omitted
`Flask-JWT-Extended`. It is now UTF-8 and can be installed normally:

```powershell
python -m pip install -r requirements.txt
```

## Verification performed

```text
Frontend TypeScript: passed
Frontend ESLint:     passed
Frontend Vite build: passed
Backend compilation: passed
Backend pytest:      25 passed
Socket.IO handlers:  registered
```

## Run locally

Backend terminal:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m scripts.initialize_database
python run.py
```

Frontend terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`.
