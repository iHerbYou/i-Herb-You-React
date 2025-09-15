import React from 'react';
import RecipeCard from './RecipeCard';
import { recipeData } from '../data/products';

const RecipeSection: React.FC = () => {
  return (
    <section className="py-12 bg-brand-pinkSoft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-brand-gray-900 mb-4">건강한 레시피</h2>
          <p className="text-brand-gray-600 text-lg">건강식품을 활용한 다양한 레시피를 확인하세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipeData.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              title={recipe.title}
              image={recipe.image}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="bg-brand-pink text-brand-gray-900 px-6 py-3 rounded-md hover:bg-brand-pink/80 transition-colors font-medium">
            더보기
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecipeSection;