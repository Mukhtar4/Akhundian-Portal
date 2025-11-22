
import React from 'react';
import { Project } from '../types';
import { ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const percentFunded = Math.min(100, Math.round((project.raised / project.budget) * 100));

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden group">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-800 shadow-sm">
          {project.status}
        </div>
        <div className="absolute bottom-4 left-4 bg-brand-900/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm uppercase tracking-wider">
          {project.category}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
          <MapPin className="w-3 h-3" />
          <span className="uppercase tracking-wider font-semibold">{project.location}</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{project.title}</h3>
        <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">
          {project.description}
        </p>

        <div className="mt-auto space-y-4">
          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-brand-700">PKR {project.raised.toLocaleString()}</span>
              <span className="text-gray-500">Goal: PKR {project.budget.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-brand-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${percentFunded}%` }}
              ></div>
            </div>
          </div>

          <Link
            to="/donate"
            className="w-full flex items-center justify-center gap-2 border border-brand-600 text-brand-700 hover:bg-brand-50 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Donate to this Cause <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
