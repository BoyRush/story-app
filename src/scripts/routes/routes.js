import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';
import AddStoryPage from '../pages/add-story/add-story-page';
import StoryDetailPage from '../pages/story/story-detail-page';
import SavedPage from '../pages/saved/saved-page';

const routes = {
  '/': () => new HomePage(),
  '/about': () => new AboutPage(),
  '/login': () => new LoginPage(),
  '/register': () => new RegisterPage(),
  '/add': () => new AddStoryPage(),
  '/saved': () => SavedPage,
  '/stories/:id': () => new StoryDetailPage(),
};

export default routes;
