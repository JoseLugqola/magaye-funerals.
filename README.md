# 🚀 Magaye Funerals Platform - Publishing Guide

Your application is now fully prepared for production and PWA installation. Follow these steps to go live.

## 📦 Prerequisites
1. Ensure `python app.py` is running locally for testing.
2. All frontend files (`.html`, `.css`, `.js`, `.json`) are in the same directory.

## 🌐 Deploying the Backend (Flask)
We recommend **PythonAnywhere** or **Render** for easy hosting.

### Option A: Render (Easiest)
1. Push your code to a GitHub repository.
2. Log in to [Render.com](https://render.com).
3. Create a new **Web Service**.
4. Connect your GitHub repo.
5. **Runtime**: Python
6. **Build Command**: `pip install -r requirements.txt`
7. **Start Command**: `python app.py`

### Option B: PythonAnywhere
1. Create an account on [PythonAnywhere](https://www.pythonanywhere.com/).
2. Upload all files to the `Files` tab.
3. Open a `Web` tab and create a new Flask app.
4. Set the path to your `app.py`.
5. Reload the site.

## 📱 PWA & Pro Features
Once published on an `https` domain:
- **Offline Access**: The app will cache automatically.
- **Automated Policy Docs**: Dynamic generation of printable coverage certificates.
- **Member Lifecycle**: Staff can freeze, stop, or deactivate policies with one click.
- **ID Verification**: Integrated document uploads for members, spouses, and claims.
- **Installable**: Users can "Add to Home Screen" on iOS and Android.
- **Auto-Sync**: The `script.js` will automatically detect your domain and connect to the database.

## 📁 File Structure
- `app.py`: Backend API & DB
- `index.html`: Admin Dashboard
- `guest.html`: Public Landing (Start Page)
- `customer_dashboard.html`: Member Portal
- `manifest.json`: PWA Config
- `sw.js`: Service Worker (Caching)

## 🛠️ Security
- **Staff Login**: Password is `adminpass`.
- **Member Login**: Secured with personal passwords set during registration.
- **API Base**: Automatically switches between `localhost` and Production.

---
© 2026 Magaye Funerals. Prepared for deployment.
