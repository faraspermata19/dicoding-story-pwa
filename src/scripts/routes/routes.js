// src/scripts/routes/routes.js
import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import StoryDetailPage from '../pages/story-detail/story-detail-page';
import AddStoryPage from '../pages/add-story/add-story-page'; 
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/stories/:id': new StoryDetailPage(),
  '/add': new AddStoryPage(), 
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
};

export default routes;