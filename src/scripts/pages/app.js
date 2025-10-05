// src/scripts/pages/app.js
import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import LoginPage from './auth/login-page';
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
  swRegistration = null; 

  constructor({ navigationDrawer, drawerButton, content, pushToggle }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#navList = this.#navigationDrawer.querySelector('#nav-list');
    this.#pushToggle = pushToggle;

    this._setupDrawer();
    this._registerServiceWorker();
    
    // Pastikan pushToggle ada sebelum setup dipanggil
    if (this.#pushToggle) {
        this._setupPushToggle();
    }
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
        window.location.hash = '#/login';
      });
    } else {
      const loginLink = document.createElement('li');
      loginLink.innerHTML = `<a href="#/login">Login</a>`;
      this.#navList.appendChild(loginLink);
    }
    
    // Perbarui tampilan toggle setiap kali navigasi di render
    this._updatePushToggleState();
  }

  async renderPage() {
    this._renderNavigation();
    
    const url = getActiveRoute();
    let page = routes[url];
    const loginResult = localStorage.getItem('loginResult');
    
    const authRequiredRoutes = ['/', '/add'];

    if (authRequiredRoutes.includes(url) && !loginResult) {
      page = new LoginPage();
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
}

export default App;