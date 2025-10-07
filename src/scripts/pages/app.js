// src/scripts/pages/app.js
import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
// import LoginPage tidak diperlukan lagi di sini karena akan di-load secara dinamis.
// import LoginPage from './auth/login-page'; 
import { 
    swRegister, 
    subscribePushNotification, 
    unsubscribePushNotification, 
    isPushSubscribed 
} from '../utils/sw-register';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #navList = null;
  #pushToggle = null; 
  #installAppWrapper = null; 
  #installAppButton = null; 
  deferredInstallPrompt = null; 
  swRegistration = null; 

  constructor({ navigationDrawer, drawerButton, content, pushToggle }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#navList = this.#navigationDrawer.querySelector('#nav-list');
    this.#pushToggle = pushToggle;

    // BARU: Inisialisasi elemen instalasi
    this.#installAppWrapper = this.#navigationDrawer.querySelector('#install-app-wrapper');
    this.#installAppButton = this.#navigationDrawer.querySelector('#install-app-button');

    this._setupDrawer();
    this._registerServiceWorker();
    
    // Pastikan pushToggle ada sebelum setup dipanggil
    if (this.#pushToggle) {
        this._setupPushToggle();
    }

    // PERBAIKAN KRITIS: Setup A2HS
    this._setupA2HS();
  }
 
  // BARU: Pendaftaran Service Worker (Kriteria 3)
  async _registerServiceWorker() {
    this.swRegistration = await swRegister();
    if (this.swRegistration) {
      // Setelah SW terdaftar, perbarui tampilan tombol toggle
      this._updatePushToggleState();
    }
  }
 
  // BARU: Logic Toggle Push Notification (Kriteria 2: Advanced)
  _setupPushToggle() {
    this.#pushToggle.addEventListener('change', async (e) => {
      const isChecked = e.target.checked;
      
      if (!this.swRegistration) {
        console.error('ERROR: Service Worker belum terdaftar.');
        e.target.checked = false; 
        return;
      }
      
      if (!localStorage.getItem('loginResult')) {
          console.warn('WARNING: Anda harus login untuk mengaktifkan notifikasi.');
          e.target.checked = false;
          return;
      }


      if (isChecked) {
        // Enable
        const success = await subscribePushNotification(this.swRegistration);
        if (!success) {
             e.target.checked = false; // Jika gagal, kembalikan posisi toggle
        }
      } else {
        // Disable
        await unsubscribePushNotification(this.swRegistration);
      }

      // Perbarui tampilan setelah aksi
      this._updatePushToggleState();
    });
  }

  // BARU: Perbarui Tampilan Tombol Push
  async _updatePushToggleState() {
    // Tambahkan guard clause di sini untuk mengatasi flicker/error saat rendering awal
    if (!this.#pushToggle) return; 
    
    if (!this.swRegistration || !localStorage.getItem('loginResult')) {
      this.#pushToggle.checked = false;
      this.#pushToggle.disabled = true;
      return;
    }
    
    this.#pushToggle.disabled = false;
    const isSubscribed = await isPushSubscribed(this.swRegistration);
    this.#pushToggle.checked = isSubscribed;
  }

    // --- Metode untuk A2HS ---
    _setupA2HS() {
        // Mendengarkan event 'beforeinstallprompt' dari browser
        window.addEventListener('beforeinstallprompt', (e) => {
            // Cegah mini-infobar muncul secara otomatis
            e.preventDefault();
            // Simpan event agar bisa dipicu nanti
            this.deferredInstallPrompt = e;
            
            // Tampilkan tombol/wrapper instalasi jika ada
            if (this.#installAppWrapper) {
                this.#installAppWrapper.style.display = 'block';
            }
            
            console.log('beforeinstallprompt event di-tangkap. Tombol install muncul.');
        });

        // Tambahkan event listener pada tombol instalasi
        if (this.#installAppButton) {
            this.#installAppButton.addEventListener('click', async () => {
                if (this.deferredInstallPrompt) {
                    // Tampilkan prompt instalasi ke user
                    this.deferredInstallPrompt.prompt();

                    // Tunggu respon user
                    const { outcome } = await this.deferredInstallPrompt.userChoice;

                    console.log(`User response to the install prompt: ${outcome}`);

                    // Sembunyikan tombol/wrapper setelah instalasi (berhasil atau gagal)
                    if (this.#installAppWrapper) {
                        this.#installAppWrapper.style.display = 'none';
                    }
                    
                    // Reset deferred prompt
                    this.deferredInstallPrompt = null;
                }
            });
        }

        // Mendengarkan event 'appinstalled' untuk memastikan status instalasi
        window.addEventListener('appinstalled', () => {
            console.log('PWA berhasil diinstal!');
            // Sembunyikan tombol/wrapper setelah diinstal
            if (this.#installAppWrapper) {
                this.#installAppWrapper.style.display = 'none';
            }
        });
    }
    // --- AKHIR Metode untuk A2HS ---
 
  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }
 
  _renderNavigation() {
    const loginResult = localStorage.getItem('loginResult');
    this.#navList.innerHTML = '';
    
    const homeLink = document.createElement('li');
    homeLink.innerHTML = `<a href="#/">Beranda</a>`;
    this.#navList.appendChild(homeLink);

    // Tambahkan link ke halaman favorit
// [✅ TAMBAHAN KRITERIA 4]
    const favoriteLink = document.createElement('li');
    favoriteLink.innerHTML = `<a href="#/favorites">Favorit</a>`;
    this.#navList.appendChild(favoriteLink);

    const aboutLink = document.createElement('li');
    aboutLink.innerHTML = `<a href="#/about">About</a>`;
    this.#navList.appendChild(aboutLink);

    if (loginResult) {
      const addStoryLink = document.createElement('li');
      addStoryLink.innerHTML = `<a href="#/add">Tambah Cerita</a>`;
      this.#navList.appendChild(addStoryLink);

      const logoutLink = document.createElement('li');
      logoutLink.innerHTML = `<a href="#" id="logout-link">Logout</a>`;
      this.#navList.appendChild(logoutLink);

      logoutLink.addEventListener('click', () => {
        localStorage.removeItem('loginResult');
        // PERBAIKAN: Unsubscribe push saat logout
        if (this.swRegistration) {
            unsubscribePushNotification(this.swRegistration).then(() => {
                window.location.hash = '#/login';
            });
        } else {
            window.location.hash = '#/login';
        }
      });
    } else {
      const loginLink = document.createElement('li');
      loginLink.innerHTML = `<a href="#/login">Login</a>`;
      this.#navList.appendChild(loginLink);
    }
    
    // Perbarui tampilan toggle setiap kali navigasi di render
    this._updatePushToggleState();
  }

    // --- PERBAIKAN KRITIS: Memuat Halaman secara Asinkron (Dynamic Import) ---
    async renderPage() {
        this._renderNavigation();
        
        const url = getActiveRoute();
        let pageModuleLoader = routes[url]; // Ini adalah fungsi Promise dari routes.js
        const loginResult = localStorage.getItem('loginResult');
        
        const authRequiredRoutes = ['/', '/add'];

        let page;
        if (authRequiredRoutes.includes(url) && !loginResult) {
            // Jika butuh login tapi belum, ganti loader ke LoginPage (dynamic import)
            const module = await import('./auth/login-page');
            page = new module.default();
        } else if (pageModuleLoader) {
            // Load modul halaman sesuai route
            const module = await pageModuleLoader();
            // Buat instance dari Page Class (asumsi modul diekspor sebagai default class)
            page = new module.default(); 
        } else {
             // Handle 404 (optional, but good practice)
             this.#content.innerHTML = '<div class="container"><h1>404 Not Found</h1><p>Halaman tidak ditemukan.</p></div>';
             return;
        }

        // Terapkan View Transition API
        if (!document.startViewTransition) {
            this.#content.innerHTML = await page.render();
            await page.afterRender();
            return;
        }

        document.startViewTransition(async () => {
            this.#content.innerHTML = await page.render();
            await page.afterRender();
        });
    }
    // --- AKHIR PERBAIKAN KRITIS: Memuat Halaman secara Asinkron (Dynamic Import) ---
}

export default App;
