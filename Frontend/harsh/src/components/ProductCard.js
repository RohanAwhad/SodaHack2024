import React, { useState } from 'react';

const ProductCard = ({ productInfo }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState(null);

  return (
    <div className="flex flex-row space-x-4 bg-base-100/50 rounded-lg max-w-6xl shadow-md min-w-max">
      <div className="basis-2/6 p-6">
        <h2 className="text-2xl font-bold mb-4 text-primary">Products</h2>
        <ul>
          {productInfo.map((product, index) => (
            <div key={index} className='btn btn-outline w-full text-wrap btn-primary mt-3' onClick={() => setSelectedProduct(product)}>{product.name}</div>
          ))}
        </ul>
      </div>

      {selectedProduct && (
        <div className="basis-4/6 p-3">
          <h2 className="text-2xl font-bold mb-4 text-wrap text-secondary-content">{selectedProduct.name} Domains</h2>
          <ul>
            {selectedProduct.domains.map((domain, index) => (
              <li key={index}>
                <div className="collapse collapse-arrow bg-base-200 mt-2">
                    <input type="checkbox" name="my-accordion-2" defaultChecked />
                    <div className="collapse-title text-xl font-medium">{domain.name}</div>
                    <div className="collapse-content">
                        <div className="mt-2 ml-4">
                            <p><strong>Status:</strong> {domain.status}</p>
                            <p><strong>Haunted/Illegal:</strong> {domain.haunted_illegal}</p>
                            <p><strong>Offering:</strong> {domain.offering}</p>
                            <p><strong>Description:</strong> {domain.description}</p>
                        </div>
                    </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductCard;