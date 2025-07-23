import React from 'react';
import { Users, ArrowRight, Linkedin, Mail } from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';

const TeamPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Team & <span className="text-plasma">Governance</span>
          </h1>
          <p className="text-xl text-gray-300">
            Meet the visionaries behind DRONERA's revolutionary aerospace technology.
          </p>
        </div>

        {/* Leadership Team */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 flex items-center">
            <Users className="text-plasma mr-3 w-7 h-7" />
            Leadership Team
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Florin Scripcă */}
            <HudPanel className="p-6">
              <div className="aspect-square mb-6 relative overflow-hidden rounded">
                <img src="/images/Florin_Scripca.png" alt="Florin Scripca" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex space-x-2">
                    <a href="https://www.linkedin.com/in/florin-scripca-08230442/" target="_blank" rel="noopener noreferrer" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href="mailto:florin@dronera.eu" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1">Florin Scripcă</h3>
              <p className="text-plasma mono text-sm mb-3">Co-Founder & CEO</p>
              <p className="text-gray-300 text-sm mb-4">
                Business management and law specialist, former prosecutor and army military academy graduate with expertise in defense sector and technology.
              </p>
            </HudPanel>

            {/* Ciprian N. Filip */}
            <HudPanel className="p-6">
              <div className="aspect-square mb-6 relative overflow-hidden rounded">
                <img src="/images/Ciprian_Filip.png" alt="Ciprian N. Filip" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex space-x-2">
                    <a href="https://www.linkedin.com/in/ciprianfilip" target="_blank" rel="noopener noreferrer" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href="mailto:cf@dronera.eu" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1">Ciprian N. Filip</h3>
              <p className="text-plasma mono text-sm mb-3">Co-Founder & Advisor</p>
              <p className="text-gray-300 text-sm mb-4">
                Former IBM-er with 20+ years expertise in technology, including blockchain and AI. 8+ years active tokenization advisory experience.
              </p>
            </HudPanel>

            {/* Dr. Arun Kumar */}
            <HudPanel className="p-6">
              <div className="aspect-square mb-6 relative overflow-hidden rounded">
                <img src="/images/Dr.Arun_Kumar.png" alt="Dr. Arun Kumar" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex space-x-2">
                    <a href="https://www.linkedin.com/in/dr-s-ajith-arun-kumars-40b1961a/" target="_blank" rel="noopener noreferrer" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href="mailto:arun@dronera.com" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1">Dr. Arun Kumar</h3>
              <p className="text-plasma mono text-sm mb-3">Dr. Researcher</p>
              <p className="text-gray-300 text-sm mb-4">
                Fractal Geometry–based EC, Nanogeneseq Chip, Helinaser, Cybertransmaya, and Nano turbine, Advanced Propulsion Systems
              </p>
            </HudPanel>

            {/* Dr. Ajith Kumar */}
            <HudPanel className="p-6">
              <div className="aspect-square mb-6 relative overflow-hidden rounded">
                <img src="/images/Dr.Ajit_Kumar.png" alt="Dr. Ajith Kumar" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex space-x-2">
                    <a href="https://www.linkedin.com/in/dr-s-ajith-arun-kumars-40b1961a/" target="_blank" rel="noopener noreferrer" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href="mailto:ajith@dronera.eu" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1">Dr. Ajith Kumar</h3>
              <p className="text-plasma mono text-sm mb-3">Research Scientist, Hypersonic Energy HLEV</p>
              <p className="text-gray-300 text-sm mb-4">
                Researcher Nanogeneseq Chip, Helinaser
              </p>
            </HudPanel>

            {/* Cristian Doroftei */}
            <HudPanel className="p-6">
              <div className="aspect-square mb-6 relative overflow-hidden rounded">
                <img src="/images/Cristian _Doroftei.png" alt="Doroftei Cristian" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex space-x-2">
                    <a href="https://www.linkedin.com/in/doroftei" target="_blank" rel="noopener noreferrer" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href="mailto:cristian@dronera.eu" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1">Cristian Doroftei</h3>
              <p className="text-plasma mono text-sm mb-3">Research Scientist</p>
              <p className="text-gray-300 text-sm mb-4">
                Electronics, Electricity and ITC specialist
              </p>
            </HudPanel>

            {/* Mikael Mayla */}
            <HudPanel className="p-6">
              <div className="aspect-square mb-6 relative overflow-hidden rounded">
                <img src="/images/Mikael_Mayla.png" alt="Mikael Mayla" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex space-x-2">
                    <a href="https://www.linkedin.com/in/mikael-j-david-mayila-252111161/" target="_blank" rel="noopener noreferrer" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href="mailto:mikael@dronera.eu" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1">Mikael Jean David Mayla</h3>
              <p className="text-plasma mono text-sm mb-3">Law Advisor</p>
              <p className="text-gray-300 text-sm mb-4">
                Law and crypto asset specialist.
              </p>
            </HudPanel>

          </div>
        </section>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-xl text-gray-300 mb-6">
            Join our team of visionaries building the future of aerospace defense
          </p>
          <CyberButton to="/token" className="mx-auto">
            <span>Explore Investment Opportunities</span>
            <ArrowRight className="w-5 h-5" />
          </CyberButton>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
