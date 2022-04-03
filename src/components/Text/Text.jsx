import cx from 'classnames';
import styles from './Text.module.scss';

const Text = ({ value }) => {
  const block = 'text';

  return <p className={cx(styles[block])}>{value}</p>;
};

export default Text;
