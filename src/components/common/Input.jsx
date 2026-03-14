import React from 'react';
import '../components.css/Input.css';

const Input = ({ type = "text", placeholder, icon, onChange, value, className }) => {
  return (
    <div className={`common-input-wrapper ${className || ''}`}>
      {icon && <i className={icon}></i>}
      <input 
        type={type} 
        placeholder={placeholder} 
        value={value} 
        onChange={onChange}
      />
    </div>
  );
};

export default Input;