# Install on Another PC - Easy Guide

## Quick Installation (3 Steps)

### Step 1: Copy Files to Target PC

**Option A: Using Git (Recommended)**
```bash
git clone https://github.com/Ahmed-Ihsan/Pharmacies-MVP.git
cd Pharmacies-MVP
```

**Option B: Using USB Drive**
1. Copy the entire `cydl` folder to a USB drive
2. Plug USB into target PC
3. Copy folder to Desktop or desired location

**Option C: Using ZIP File**
1. Right-click the `cydl` folder
2. Send to → Compressed (zipped) folder
3. Copy ZIP to target PC and extract

### Step 2: Install Docker Desktop (One-time setup)

**Important: This is the ONLY thing you need to install on the target PC.**

1. Download: https://www.docker.com/products/docker-desktop/
2. Run installer and follow prompts
3. Restart computer when asked
4. Start Docker Desktop from Start menu
5. Wait for Docker to fully start (tray icon shows running)

**You do NOT need to install:**
- ❌ Python
- ❌ Node.js
- ❌ npm
- ❌ nginx
- ❌ Database servers
- ❌ Any other development tools

Docker containers include everything automatically.

### Step 3: Deploy Application

Open PowerShell or Command Prompt in the project folder and run:

```bash
# Windows - Using the deployment script
.\deploy-docker.bat

# OR - Manual command
docker-compose build
docker-compose up -d
```

That's it! The application will be available at:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## What Gets Installed

The Docker setup automatically installs:
- Python 3.10 runtime (in container)
- Node.js 20 runtime (in container)
- nginx web server (in container)
- SQLite database
- All application dependencies

**No manual installation of Python, Node.js, or databases required on the target PC.**

---

## Troubleshooting

### Docker not recognized
- Ensure Docker Desktop is installed and running
- Restart PowerShell/Command Prompt after installing Docker

### Port already in use
- Edit `docker-compose.yml` and change ports:
  - Change `"8000:8000"` to `"8001:8000"`
  - Change `"80:80"` to `"8080:80"`

### Build fails
- Clear Docker cache:
  ```bash
  docker-compose down -v
  docker system prune -a
  docker-compose up --build
  ```

### Database not persisting
- Ensure `data/` folder exists in the project directory
- Check folder permissions

---

## To Stop the Application

```bash
docker-compose down
```

## To Start Again Later

```bash
docker-compose up -d
```

## To Update the Application

1. Copy new files to the `cydl` folder
2. Run:
   ```bash
   docker-compose up --build -d
   ```

---

## System Requirements

- Windows 10/11 64-bit
- 4GB RAM minimum (8GB recommended)
- 10GB free disk space
- Internet connection (for first build to download Docker images)

---

## Uninstalling

To completely remove the application:
```bash
docker-compose down -v
docker system prune -a
```

Then delete the `cydl` folder.

---

## Database Backup & Restore

### Backup Database

Run the backup script:
```bash
.\backup-database.bat
```

This creates a timestamped backup in the `backups/` directory:
- Format: `pharmacy_backup_YYYY-MM-DD_HH-MM-SS.db`
- Backups are stored locally on the host machine

### Restore Database

Run the restore script:
```bash
.\restore-database.bat
```

You will be prompted to:
1. Select which backup file to restore
2. Confirm the restore operation
3. The application will restart automatically after restore

### Manual Backup (Alternative)

```bash
# Copy database from container
docker cp pharmacy-backend:/app/data/pharmacy.db ./backups/pharmacy_manual_backup.db
```

### Manual Restore (Alternative)

```bash
# Stop containers
docker-compose down

# Copy backup to data directory
copy backups\pharmacy_backup_YYYY-MM-DD_HH-MM-SS.db data\pharmacy.db

# Start containers
docker-compose up -d
```

### Backup Location

All backups are stored in the `backups/` folder within the project directory. You can also copy this folder to external storage for additional safety.
