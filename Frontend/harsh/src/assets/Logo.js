import React from 'react';

const Logo = () => (
  <svg width="500" height="300" viewBox="0 0 100 55"> {/* Adjust viewBox to fit your image */}
    <image
      href="faith.png" // Replace with the actual URL of your image
      x="5" // Adjust the x position as needed
      y="0" // Adjust the y position as needed
      width="100" // Adjust the width of the image
      height="45" // Adjust the height of the image
      preserveAspectRatio="xMidYMid meet" // Maintains aspect ratio
    />
  </svg>
);

export default Logo;