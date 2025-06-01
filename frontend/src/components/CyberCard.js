const CyberCard = ({ children, className }) => {
  return (
    <div className={`cyber-card ${className || ''}`}>
      {children}
    </div>
  );
};
export default CyberCard;