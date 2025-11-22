
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Users, Droplets, GraduationCap } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import ProjectCard from '../components/ProjectCard';
import { ProjectStatus } from '../types';

const StatCard = ({ icon: Icon, value, label }: { icon: any, value: string, label: string }) => (
  <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm border border-gray-100 text-center">
    <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mb-4 text-brand-600">
      <Icon className="w-6 h-6" />
    </div>
    <span className="text-3xl font-extrabold text-gray-900 mb-1">{value}</span>
    <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">{label}</span>
  </div>
);

const Home: React.FC = () => {
  const { projects } = useData();
  
  // Only show first 3 active projects from the global state
  const featuredProjects = projects
    .filter(p => p.status === ProjectStatus.ACTIVE)
    .slice(0, 3);

  // Fallback if no active projects, just show recent ones
  const displayProjects = featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 3);

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero Section */}
      <section className="relative bg-gray-900 h-[600px] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://picsum.photos/1920/1080?random=10"
            alt="Community Work"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center md:text-left">
          <span className="inline-block px-4 py-1 rounded-full bg-brand-500/20 border border-brand-400 text-brand-300 text-sm font-semibold mb-6 backdrop-blur-sm">
            Non-Profit Organization
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6 max-w-3xl">
            Empowering Pakistan's<br />
            <span className="text-brand-400">Future Generations</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
            Akhundian Foundation is dedicated to sustainable development through education, healthcare, and disaster relief across the underserved regions of Pakistan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              to="/donate"
              className="bg-brand-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-brand-700 transition shadow-lg shadow-brand-900/50"
            >
              Make a Donation
            </Link>
            <Link
              to="/projects"
              className="bg-white text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
            >
              View Our Work
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Heart} value="150K+" label="Lives Impacted" />
          <StatCard icon={Users} value="1,200+" label="Volunteers" />
          <StatCard icon={GraduationCap} value="50+" label="Schools Built" />
          <StatCard icon={Droplets} value="300+" label="Water Wells" />
        </div>
      </div>

      {/* Mission Statement */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Core Mission</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            "To bridge the gap between privilege and poverty by creating sustainable ecosystems where education, health, and basic necessities are accessible to every citizen of Pakistan, regardless of their background."
          </p>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Campaigns</h2>
              <p className="text-gray-600">Support our urgent causes today.</p>
            </div>
            <Link to="/projects" className="hidden md:flex items-center gap-2 text-brand-700 font-semibold hover:text-brand-800 transition">
              View All Projects <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/projects" className="text-brand-700 font-semibold hover:text-brand-800">
              View All Projects &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action - Volunteer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-900 rounded-2xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-brand-800 rounded-full opacity-50 blur-3xl"></div>
          
          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl font-bold text-white mb-4">Join Our Volunteer Network</h2>
            <p className="text-brand-100 mb-8 text-lg">
              We need passionate individuals like you to help distribute aid, teach in our schools, and coordinate field operations.
            </p>
            <Link
              to="/volunteer"
              className="inline-block bg-white text-brand-900 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
            >
              Apply as Volunteer
            </Link>
          </div>
          <div className="relative z-10 w-full md:w-1/2">
            <img 
              src="https://picsum.photos/600/400?random=20" 
              alt="Volunteers" 
              className="rounded-xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 border-4 border-brand-700"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
