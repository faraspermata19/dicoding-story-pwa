// src/scripts/pages/auth/register-page.js
import { userRegister } from '../../data/api';

export default class RegisterPage {
  async render() {
    return `
      <section class="container">
        <h1>Daftar Akun Baru</h1>
        <form id="register-form">
          <div class="form-group">
            <label for="name">Nama Lengkap</label>
            <input type="text" id="name" name="name" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required minlength="8">
          </div>
          <button type="submit">Daftar</button>
        </form>
        <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
      </section>
    `;
  }
  
  async afterRender() {
    const form = document.querySelector('#register-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = form.querySelector('#name').value;
      const email = form.querySelector('#email').value;
      const password = form.querySelector('#password').value;
      
      try {
        const response = await userRegister({ name, email, password });
        const responseJson = await response.json();
        
        if (!responseJson.error) {
          alert('Pendaftaran berhasil! Silakan login.');
          window.location.hash = '#/login';
        } else {
          alert(responseJson.message);
        }
      } catch (error) {
        console.error(error);
        alert('Terjadi kesalahan saat pendaftaran.');
      }
    });
  }
}