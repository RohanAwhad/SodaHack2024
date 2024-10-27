import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import Logo from './assets/Logo';
import SearchIcon from './assets/SearchIcon';
import DomainCard from './components/DomainCard';
import ProductCard from './components/ProductCard';
import { suggestProductNames, suggestDomainNames, checkDomainOffering, checkIllegalActivity, checkDomainAvailability } from './api'; // Adjust the import path as necessary

const HauntedDomainChecker = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Regular expression to validate domain names
    const domainRegex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/.*)?$/;
    
    if (domainRegex.test(searchTerm)) {
      // Extract the domain name (group 3 of the regex)
      const extractedDomain = searchTerm.replace(domainRegex, '$3');
  
      // Set product name to the extracted domain
      const productName = extractedDomain;
      const singleDomain = [{ domain_name: extractedDomain }];
  
      try {
        // Fetch all required information for the extracted domain
        const [offering, illegalActivity, availability] = await Promise.all([
          checkDomainOffering(extractedDomain),
          checkIllegalActivity(extractedDomain),
          checkDomainAvailability(extractedDomain),
        ]);
  
        const domainDetails = [{
          name: extractedDomain,
          status: availability.available ? 'Available' : 'Unavailable',
          haunted_illegal: illegalActivity.illegal_activity ? 'Yes' : 'No',
          offering: offering.use_case.join(', '),
          description: `Description for ${extractedDomain}`, // Customize as needed
        }];
  
        // Set the search result with a single product and domain
        setSearchResult([{ name: productName, domains: domainDetails }]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setSearchResult(null);
      }
    } else {
      // If it's not a valid domain, proceed with the original logic
      try {
        const productNames = await suggestProductNames(searchTerm);
        const productsWithDomains = await Promise.all(productNames.map(async (product) => {
          const domainNames = await suggestDomainNames(product.product_name);
          const domainsWithDetails = await Promise.all(domainNames.map(async (domain) => {
            const [offering, illegalActivity, availability] = await Promise.all([
              checkDomainOffering(domain.domain_name),
              checkIllegalActivity(domain.domain_name),
              checkDomainAvailability(domain.domain_name),
            ]);
            return {
              name: domain.domain_name,
              status: availability.available ? 'Available' : 'Unavailable',
              haunted_illegal: illegalActivity.illegal_activity ? 'Yes' : 'No',
              offering: offering.use_case.join(', '),
              description: `Description for ${domain.domain_name}`, // Customize as needed
            };
          }));
          return {
            name: product.product_name,
            domains: domainsWithDetails,
          };
        }));
        setSearchResult(productsWithDomains);
      } catch (error) {
        console.error('Error fetching data:', error);
        setSearchResult(null);
      }
    }
  };
  

  return (
    <div className="bg-gradient-to-t from-black to-black opacity-95">
      <div className="container pt-5 mx-auto max-w-6xl min-h-screen justify-items-center">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://static.vecteezy.com/system/resources/previews/049/513/630/non_2x/moody-dark-clouds-on-black-background-cut-out-transparent-png.png')] bg-repeat opacity-[0.49] filter blur-[20px] z-0 animate-[moveClouds_30s_linear_infinite]">
        </div>
        <div className="content max-w-3xl">
          <div className="logo max-w-2xl"> <Logo />
            <div className="mb-10 text-center text-xl text-white">
              <p className='drop-shadow'>Welcome to the Haunted Domain Checker!</p>
              <p>Is your domain cursed? Find out now!</p>
            </div>
          </div>
          <div className="searchWrapper max-w-3xl">
            <form onSubmit={handleSubmit} className={`searchContainer ${isFocused ? 'focused' : ''}`}>
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Enter a domain or product to check..."
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
          {searchResult && (
            <div className="mt-8 max-w-2xl min-w-full">
              <ProductCard key='product-card' productInfo={searchResult} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HauntedDomainChecker;
