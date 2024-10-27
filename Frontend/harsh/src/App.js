import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import Logo from './assets/Logo';
import SearchIcon from './assets/SearchIcon';
import ResultCard from './components/ResultCard';

const HauntedDomainChecker = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
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

  const checkDomainStatus = (domain) => {
    const statuses = ['Available', 'Registered', 'Expired', 'Reserved'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Domain to check:', searchTerm);
    
    const mockResults = {
      'domain-status': checkDomainStatus(searchTerm),
      'product-names': [' Product', ' Item'],
      'domain-names': ['domain.com', 'domain.net'],
      'domain-research/illegal-activity': 'No illegal activity detected',
      'domain-research/offering': 'Test'
    };
    
    setSearchResults(mockResults);
  };

  return (
    <div className='bg-gradient-to-t from-black to-black opacity-95 min-h-screen'>
      <div className="container pt-5 mx-auto max-w-6xl justify-items-center">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://static.vecteezy.com/system/resources/previews/049/513/630/non_2x/moody-dark-clouds-on-black-background-cut-out-transparent-png.png')] bg-repeat opacity-[0.49] filter blur-[20px] z-0 animate-[moveClouds_30s_linear_infinite]">
        </div>
        <div className="content">
          <div className="logo max-w-2xl">
            <Logo />
            <div className="mb-10 text-center text-xl text-white">
              <p className='drop-shadow'>Welcome to the Haunted Domain Checker!</p>
              <p>Is your domain cursed? Find out now!</p>
            </div>
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
          {searchResults && (
            <div className="results-container mt-8 w-full">
              {Object.entries(searchResults).map(([key, value]) => (
                <div key={key} className="relative mb-4">
                  <ResultCard 
                    title={key.replace(/-/g, ' ').replace(/\//, ' - ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} 
                    data={value} 
                  />
                  <div className="-inset-0.5 opacity-30 rounded-lg z-0"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HauntedDomainChecker;