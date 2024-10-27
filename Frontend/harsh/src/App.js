import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import Logo from './assets/Logo';
import SearchIcon from './assets/SearchIcon';

const HauntedDomainChecker = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Domain to check:', searchTerm);
    // Here you would typically handle the domain check action
  };

  return (
    <div className="container">
      {/* Add the clouds div here */}
      <div className="clouds"></div>
      <div className="content">
        <div className="logo">
          <Logo />
        </div>
        <div className="info">
          <p>Welcome to the Haunted Domain Checker!</p>
          <p>Is your domain cursed? Find out now!</p>
        </div>
        <div className="searchWrapper">
          <form onSubmit={handleSubmit} className={`searchContainer ${isFocused ? 'focused' : ''}`}>
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Enter a domain to check..."
              className="input"
              onFocus={() => setIsFocused(true)}
              aria-label="Search"
            />
            <button type="submit" className="iconContainer" aria-label="Check domain">
              <SearchIcon />
            </button>
          </form>
          {isFocused && <div className="glow" />}
        </div>
      </div>
    </div>
  );
};

export default HauntedDomainChecker;