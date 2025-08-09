import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { MovieCard } from './MovieCard';
import { WatchlistItem, WatchlistCategory } from '../contexts/AppContext';
import { Film, Eye, Clock, CheckCircle, ArrowRight, Star, Trash2, Calendar, Play } from 'lucide-react';

interface WatchlistGridProps {
  items: WatchlistItem[];
  onMovieClick: (movieId: number) => void;
  onCategoryChange: (tmdbId: number, category: WatchlistCategory) => void;
  onRemove: (tmdbId: number) => void;
  onRatingChange: (tmdbId: number, rating: number) => void;
  onReorder?: (newOrder: WatchlistItem[]) => void;
}

const CATEGORY_CONFIG = {
  'want-to-watch': {
    title: 'Want to Watch',
    icon: Film,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/30'
  },
  'watching': {
    title: 'Currently Watching',
    icon: Eye,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/30'
  },
  'watched': {
    title: 'Watched',
    icon: CheckCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    borderColor: 'border-green-400/30'
  }
};

export function WatchlistGrid({ 
  items, 
  onMovieClick, 
  onCategoryChange, 
  onRemove, 
  onRatingChange,
  onReorder
}: WatchlistGridProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'want-to-watch';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<WatchlistCategory, WatchlistItem[]>);

  const handleDragStart = (start: any) => {
    setDraggedItem(start.draggableId);
  };

  const handleDragEnd = (result: DropResult) => {
    setDraggedItem(null);
    
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Find the item being moved
    const item = items.find(item => item.id === draggableId);
    if (!item || !item.movie) {
      return;
    }

    // Update category if dropped in different column
    if (destination.droppableId !== source.droppableId) {
      const newCategory = destination.droppableId as WatchlistCategory;
      const movieId = (item.movie as any).id;
      onCategoryChange(movieId, newCategory);
      
      // Notify parent of reorder if callback provided
      if (onReorder) {
        const reorderedItems = [...items];
        const [movedItem] = reorderedItems.splice(source.index, 1);
        reorderedItems.splice(destination.index, 0, { ...movedItem, category: newCategory });
        onReorder(reorderedItems);
      }
    }
  };

  const getCategoryButtons = (currentCategory: WatchlistCategory) => {
    // Forward-only movement
    const buttons = [];
    
    if (currentCategory === 'want-to-watch') {
      buttons.push({
        category: 'watching' as WatchlistCategory,
        label: 'Start Watching',
        icon: Eye
      });
    } else if (currentCategory === 'watching') {
      buttons.push({
        category: 'watched' as WatchlistCategory,
        label: 'Mark as Watched',
        icon: CheckCircle
      });
    }
    // No buttons for 'watched' category (end of flow)
    
    return buttons;
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {(Object.keys(CATEGORY_CONFIG) as WatchlistCategory[]).map((category) => {
          const config = CATEGORY_CONFIG[category];
          const categoryItems = groupedItems[category] || [];
          const Icon = config.icon;

          return (
            <div key={category} className="space-y-6">
              {/* Category Header */}
              <div className={`glassmorphism rounded-2xl p-6 ${config.bgColor} border ${config.borderColor}`}>
                <div className="flex items-center space-x-3 mb-2">
                  <Icon className={`w-6 h-6 ${config.color}`} />
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    {config.title}
                  </h2>
                </div>
                <p className="text-gray-300 font-medium">
                  {categoryItems.length} movie{categoryItems.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={category}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] space-y-6 transition-all duration-200 ${
                      snapshot.isDraggingOver 
                        ? `${config.bgColor} rounded-2xl p-4 border-2 border-dashed ${config.borderColor}` 
                        : ''
                    }`}
                  >
                    {categoryItems.map((item, index) => {
                      if (!item.movie) return null;

                      const categoryButtons = getCategoryButtons(item.category || 'want-to-watch');

                      return (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`transition-all duration-200 ${
                                snapshot.isDragging 
                                  ? 'rotate-3 scale-105 shadow-2xl shadow-yellow-400/20' 
                                  : ''
                              } ${
                                draggedItem === item.id && !snapshot.isDragging
                                  ? 'opacity-50'
                                  : ''
                              }`}
                            >
                              <div 
                                className="group relative rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-yellow-400/10 transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden border border-white/10 hover:border-yellow-400/50 animate-fade-in bg-gray-800/50"
                                onClick={() => onMovieClick((item.movie as any).id)}
                              >
                                {/* Poster Image */}
                                <div className="relative aspect-[2/3] overflow-hidden">
                                  <img
                                    src={`https://image.tmdb.org/t/p/w500${(item.movie as any).poster_path}`}
                                    alt={(item.movie as any).title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    loading="lazy"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=500&h=750&fit=crop';
                                    }}
                                  />
                                  
                                  {/* Gradient Overlay for hover content */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  
                                  {/* Rating Badge */}
                                  {(item.movie as any).vote_average > 0 && (
                                    <div className="absolute top-3 left-3 glassmorphism text-white px-3 py-1.5 rounded-xl text-sm font-bold flex items-center space-x-1.5">
                                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                      <span>{(item.movie as any).vote_average.toFixed(1)}</span>
                                    </div>
                                  )}

                                  {/* Delete Icon */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRemove((item.movie as any).id);
                                    }}
                                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-red-600/80 backdrop-blur-sm text-white hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 active:scale-95 transform"
                                    title="Remove from watchlist"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>

                                  {/* Hover Content - Title and Date */}
                                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <h3 className="font-extrabold text-lg text-white line-clamp-2 mb-2 tracking-tight">
                                      {(item.movie as any).title}
                                    </h3>
                                    
                                    <div className="flex items-center space-x-2 text-sm text-gray-300 mb-3">
                                      <Calendar className="w-4 h-4" />
                                      <span>
                                        {(item.movie as any).release_date ? 
                                          new Date((item.movie as any).release_date).getFullYear() : 
                                          ''
                                        }
                                      </span>
                                    </div>

                                    {/* Category Movement Button - Single Button Style */}
                                    <div className="space-y-2">
                                      {categoryButtons.map((button) => {
                                        const ButtonIcon = button.icon;
                                        return (
                                          <button
                                            key={button.category}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onCategoryChange((item.movie as any).id, button.category);
                                            }}
                                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-bold transition-all active:scale-95 transform bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 hover:from-yellow-300 hover:to-yellow-200 hover:shadow-lg text-base"
                                          >
                                            <ButtonIcon className="w-4 h-4" />
                                            <span>
                                              {button.category === 'want-to-watch' ? 'Move to Want to Watch' :
                                               button.category === 'watching' ? 'Move to Currently Watching' :
                                               'Move to Watched'}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>

                                {/* Static Info (Always Visible) */}
                                <div className="p-4 bg-gray-800/80 backdrop-blur-sm">
                                  <h3 className="font-extrabold text-base text-white line-clamp-2 mb-2 tracking-tight">
                                    {(item.movie as any).title}
                                  </h3>
                                  
                                  <div className="flex items-center justify-between text-sm text-gray-300">
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="w-3.5 h-3.5" />
                                      <span>
                                        {(item.movie as any).release_date ? 
                                          new Date((item.movie as any).release_date).getFullYear() : 
                                          ''
                                        }
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                      {item.user_rating && (
                                        <div className="flex items-center space-x-1 text-yellow-400">
                                          <Star className="w-3.5 h-3.5 fill-yellow-400" />
                                          <span className="font-bold">{item.user_rating}</span>
                                        </div>
                                      )}
                                      {(item.movie as any).vote_average > 0 && (
                                        <div className="flex items-center space-x-1">
                                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                          <span className="font-medium">{(item.movie as any).vote_average.toFixed(1)}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}

                    {/* Empty State */}
                    {categoryItems.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Icon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No movies in this category</p>
                        <p className="text-sm">Add movies here to organize them</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}