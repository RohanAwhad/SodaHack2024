import React from 'react';
import logoImage from './faith.png'; // Adjust the path to your logo image

const Logo = () => (
  <img 
    src={logoImage} 
    alt="Logo" 
    style={{ display: 'block', margin: '0', width: '100%', height: 'auto' }} // Adjust styles as needed
  />
);

export default Logo;