import React from 'react';

interface RecipeCardProps {
  title: string;
  image: string;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ title, image }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Recipe Image */}
      <div className="aspect-video bg-gray-100 relative">
        <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" />
      </div>

      {/* Recipe Info */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-brand-gray-900 mb-2 line-clamp-2 leading-tight">
          {title}
        </h3>
        
        <a href="#" className="group inline-flex items-center text-sm text-brand-gray-900 font-medium hover:underline underline-offset-4">
          <span>자세히 살펴보기</span>
          <svg
            className="w-4 h-4 ml-1 text-brand-gray-900 transform transition-transform group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default RecipeCard;