import React, { useState } from 'react';
import { Shield, Rocket, Zap, Box, ArrowRight, Clock, Info, X, Filter, Code, Cpu } from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';

// Export droneModels for use in other components
export const droneModels = [
  {
    id: "early-access",
    name: "Early Access Package",
    category: "FOR INVESTORS",
    description: "Be the first to explore Dronera's secure UAV swarm ecosystem. Includes behind-the-scenes updates, live test flight streams, and investor-only reports.",
    price: "100,000 DRN",
    priceNote: "Available for reservation",
    available: true
  },
  {
    id: "vip-demo",
    name: "VIP Demo Day Invitation",
    category: "FOR INVESTORS",
    description: "Join us on-site or online for our first multi-drone swarm demonstration. Meet the team, see the tech, and get early insights into Phase 2 development.",
    price: "100,000 DRN",
    priceNote: "Mock Value",
    available: true
  },
  {
    id: "flight-control-pcb-premium",
    name: "All-in-One Flight Control PCB",
    category: "COMING SOON",
    description: "A modular, custom-designed PCB integrating AI control, quantum-secure communication, and sensor fusion.",
    price: "1,500,000 DRN",
    priceNote: "Mock value",
    available: false
  },
  {
    id: "flight-control-pcb",
    name: "All-in-One Flight Control PCB",
    category: "COMING SOON",
    description: "A modular, custom-designed PCB integrating AI control, quantum-secure communication, and sensor fusion.",
    price: "500,000 DRN",
    priceNote: "Mock value",
    available: false
  },
  {
    id: "swarm-os",
    name: "Swarm OS Software License",
    category: "COMING SOON",
    description: "Dronera's proprietary multi-agent reinforcement learning system enabling intelligent UAV swarm behavior with secure over-the-air updates.",
    price: "500,000 DRN",
    priceNote: "Mock Value",
    available: false
  },
  {
    id: "jet-uav",
    name: "Jet UAV Developer Kit",
    category: "COMING SOON",
    description: "A high-performance jet-powered drone platform integrated with Dronera's swarm OS and quantum-secured flight systems, ready for advanced R&D.",
    price: "100,000 DRN",
    priceNote: "Mock value",
    available: false
  },
  {
    id: "quantum-security",
    name: "Quantum Security Module",
    category: "COMING SOON",
    description: "Advanced quantum-resistant encryption module for secure drone communications in contested environments.",
    price: "750,000 DRN",
    priceNote: "Mock value",
    available: false
  }
];

const MarketplacePage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Investor Exclusives
  const investorExclusives = [
    {
      id: "early-access",
      name: "Early Access Package",
      category: "FOR INVESTORS",
      description: "Be the first to expilote Dronera's secure UAV swarm scoeyystem includes behind-the-scenes updates, live test flight streams, and investor-only reports.",
      price: "100,000 DRN",
      priceNote: "Available for reservation",
      available: true
    },
    {
      id: "vip-demo",
      name: "VIP Demo Day Invitation",
      category: "FOR INVESTORS",
      description: "Join us on-site online for our first mulis drone swarm demonstration. Meet the team, see thech, and get early insights into Phase 2 development.",
      price: "100,000 DRN",
      priceNote: "Mock Value",
      available: true
    },
    {
      id: "flight-control-pcb-premium",
      name: "All-in-One Flight Control PCB",
      category: "COMING SOON",
      description: "A modular, custom-designed PCB integrating AI control, quantum-secure communication, ad sensor fusion.",
      price: "1,500,000 DRN",
      priceNote: "Mock value",
      available: false
    }
  ];

  // Future Products
  const futureProducts = [
    {
      id: "flight-control-pcb",
      name: "All-in-One Flight Control PCB",
      category: "COMING SOON",
      description: "A modular, custom-designed PCB integrating AI control, quantum-secure communication, and sensor fusion.",
      price: "500,000 DRN",
      priceNote: "Mock value",
      available: false
    },
    {
      id: "swarm-os",
      name: "Swarm OS Software License",
      category: "COMING SOON",
      description: "Dronera's proprietary multi-agent reinforcement learning system enabling mt-elligent UAV swarm behavior with secure over-the-air updates.",
      price: "500,000 DRN",
      priceNote: "Mock Value",
      available: false
    },
    {
      id: "jet-uav",
      name: "Jet UAV Developer Kit",
      category: "COMING SOON",
      description: "A high-performance jet-powered drone platform integrated with Dronera's swarm OS and quantum-secured flight systems, ready for advanced R&D.",
      price: "100,000 DRN",
      priceNote: "Mock value",
      available: false
    },
    {
      id: "quantum-security",
      name: "Quantum Security Module",
      category: "COMING SOON",
      description: "Advanced quantum-resistant encryption module for secure drone communications in contested environments.",
      price: "750,000 DRN",
      priceNote: "Mock value",
      available: false
    }
  ];

  const handleReserve = (product: any) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="pt-28 pb-20 px-4 bg-[#0a0a0f]">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            DRONERA <span className="text-plasma">MARKETPLACE</span>
          </h1>
          <p className="text-xl text-gray-300">
            The Future of Aerospace, Quantum Security, and AI Swarm Flight
          </p>
        </div>

        {/* Investor Exclusives Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-white">Investor Exclusives</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {investorExclusives.map((product) => (
              <HudPanel key={product.id} className="p-6 flex flex-col h-full">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-[#0d0d14] text-xs font-semibold text-plasma rounded">
                    {product.category}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-3">{product.name}</h3>
                <p className="text-gray-300 mb-6 flex-grow">{product.description}</p>
                <div className="mt-auto">
                  <div className="mb-4">
                    <p className="text-xl font-bold text-plasma">{product.price}</p>
                    <p className="text-sm text-gray-400">{product.priceNote}</p>
                  </div>
                  <CyberButton 
                    onClick={() => handleReserve(product)} 
                    className="w-full"
                    disabled={!product.available}
                  >
                    RESERVE
                  </CyberButton>
                </div>
              </HudPanel>
            ))}
          </div>
        </section>

        {/* Future Products Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-white">Future Products</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {futureProducts.map((product) => (
              <HudPanel key={product.id} className="p-6 flex flex-col h-full">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-[#0d0d14] text-xs font-semibold text-plasma rounded">
                    {product.category}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-3">{product.name}</h3>
                <p className="text-gray-300 mb-6 flex-grow">{product.description}</p>
                <div className="mt-auto">
                  <div className="mb-4">
                    <p className="text-xl font-bold text-plasma">{product.price}</p>
                    <p className="text-sm text-gray-400">{product.priceNote}</p>
                  </div>
                  <CyberButton 
                    onClick={() => handleReserve(product)} 
                    className="w-full"
                    disabled={!product.available}
                  >
                    RESERVE
                  </CyberButton>
                </div>
              </HudPanel>
            ))}
          </div>
        </section>

        {/* Product Reservation Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <HudPanel className="max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Reserve {selectedProduct.name}</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <p className="text-gray-300">
                  Thank you for your interest in {selectedProduct.name}. This product is available for reservation by qualified investors.
                </p>
                
                <div className="bg-[#0d0d14] p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Price:</span>
                    <span className="font-bold text-plasma">{selectedProduct.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Availability:</span>
                    <span className="text-green-400">Limited Release</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-400">
                  By reserving this product, you'll be among the first to access this technology when it becomes available. Your DRONE tokens will be allocated upon confirmation.
                </p>
              </div>
              
              <div className="flex space-x-4">
                <CyberButton
                  onClick={closeModal}
                  variant="red"
                  className="flex-1"
                >
                  Cancel
                </CyberButton>
                <CyberButton
                  className="flex-1"
                  onClick={() => {
                    alert('Reservation confirmed! You will be notified when the product is available.');
                    closeModal();
                  }}
                >
                  Confirm Reservation
                </CyberButton>
              </div>
            </HudPanel>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;