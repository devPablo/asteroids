import cx from 'classnames';
import styles from './App.module.scss';

const App = () => {
  const block = 'App';

  return <p className={cx(styles[block])}>Asteroids App</p>;
};

export default App;
