const VisibleItem = ({ show, children, fallback = null }) => {
  if (!show) return fallback;

  if (typeof children === 'function') {
    return children();
  }

  return children;
};

export default VisibleItem;
