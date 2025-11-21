---
description: How to deploy Mandacaru.ai MVP
---

# Deployment Guide for Mandacaru.ai

This guide covers how to deploy the Next.js Frontend to **Vercel** and the FastAPI Backend to **Render**.

## Prerequisites

- GitHub Account (push your code to a repository first)
- Vercel Account
- Render Account
- OpenAI API Key

## 1. Prepare the Code

Ensure your project structure is organized (already done):
- `/frontend`: Next.js app
- `/backend`: FastAPI app

## 2. Deploy Backend (Render)

1.  Log in to [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Root Directory**: `backend`
5.  **Runtime**: Python 3
6.  **Build Command**: `pip install -r requirements.txt`
7.  **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`
8.  **Environment Variables**:
    - Add `OPENAI_API_KEY`: (Paste your key here)
    - Add `PYTHON_VERSION`: `3.11.0` (optional, but recommended)
9.  Click **Create Web Service**.
10. Wait for deployment. Copy the **Service URL** (e.g., `https://mandacaru-backend.onrender.com`).

## 3. Deploy Frontend (Vercel)

1.  Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Framework Preset**: Next.js (should be auto-detected).
5.  **Root Directory**: Edit and select `frontend`.
6.  **Environment Variables**:
    - Add `NEXT_PUBLIC_API_URL`: Paste the **Render Service URL** (without the trailing slash, e.g., `https://mandacaru-backend.onrender.com`).
7.  Click **Deploy**.

## 4. Final Check

1.  Open your Vercel URL.
2.  Test the flow.
3.  If you see CORS errors, you might need to update the `backend/main.py` to allow the Vercel domain in `CORSMiddleware`.

### Updating CORS (If needed)

In `backend/main.py`:
```python
origins = [
    "http://localhost:3000",
    "https://your-vercel-app.vercel.app" # Add your Vercel domain here
]
```
