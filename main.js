const { app, BrowserWindow } = require('electron');
const path = require('path');

// Detectar si estamos en modo desarrollo
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    title: 'Método Trachtenberg - Cálculo Mental',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'default',
    backgroundColor: '#1a1a2e',
    show: false // No mostrar hasta que esté listo
  });

  // Mostrar la ventana cuando esté lista
  win.once('ready-to-show', () => {
    win.show();
  });

  // Cargar la aplicación React
  if (isDev) {
    // Esperar a que el servidor de React esté listo
    const http = require('http');
    const checkServer = () => {
      const req = http.get('http://localhost:3000', (res) => {
        if (res.statusCode === 200) {
          win.loadURL('http://localhost:3000');
          win.webContents.openDevTools();
        } else {
          setTimeout(checkServer, 1000);
        }
      });
      req.on('error', () => {
        console.log('Esperando servidor de React en http://localhost:3000...');
        setTimeout(checkServer, 1000);
      });
      req.setTimeout(5000);
      req.on('timeout', () => {
        req.destroy();
        setTimeout(checkServer, 1000);
      });
    };
    checkServer();
  } else {
    win.loadFile(path.join(__dirname, 'build', 'index.html'));
  }

  // Quitar menú en producción
  if (!isDev) {
    win.setMenuBarVisibility(false);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

