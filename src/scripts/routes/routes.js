// src/scripts/routes/routes.js
//import HomePage from '../pages/home/home-page';
//import AboutPage from '../pages/about/about-page';
//import StoryDetailPage from '../pages/story-detail/story-detail-page';
//import AddStoryPage from '../pages/add-story/add-story-page'; 
//import LoginPage from '../pages/auth/login-page';
//import RegisterPage from '../pages/auth/register-page';

//const routes = {
  //'/': new HomePage(),
  //'/about': new AboutPage(),
  //'/stories/:id': new StoryDetailPage(),
  //'/add': new AddStoryPage(), 
  //'/login': new LoginPage(),
  //'/register': new RegisterPage(),
//};

//export default routes;

const routes = {
  '/': () => import('../pages/home/home-page'),
  '/about': () => import('../pages/about/about-page'),
  '/stories/:id': () => import('../pages/story-detail/story-detail-page'),
  '/add': () => import('../pages/add-story/add-story-page'), 
  '/login': () => import('../pages/auth/login-page'),
  '/register': () => import('../pages/auth/register-page'),
  '/favorites': () => import('../pages/favorite/favorite-page'), // Tambahkan rute untuk halaman favorit
};

export default routes;