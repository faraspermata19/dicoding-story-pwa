// src/scripts/pages/auth/login-page.js
import { userLogin } from '../../data/api';

export default class LoginPage {
  async render() {
    return `
      <section class="container">
        <h1>Login Pengguna</h1>
        <form id="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
          </div>
          <button type="submit">Login</button>
        </form>
        <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
      </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector('#login-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.querySelector('#email').value;
      const password = form.querySelector('#password').value;

      try {
        const response = await userLogin({ email, password });
        const responseJson = await response.json();

        if (!responseJson.error) {
          localStorage.setItem('loginResult', JSON.stringify(responseJson.loginResult));
          window.location.hash = '#/';
        } else {
          alert(responseJson.message);
        }
      } catch (error) {
        console.error(error);
      }
    });
  }
}