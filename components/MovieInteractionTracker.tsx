"use client";
import { useEffect } from 'react';

const MovieInteractionTracker = ({ movieId }: { movieId: string }) => {
  useEffect(() => {
    let distinctMovies = JSON.parse(localStorage.getItem('distinctMoviesOpened') || '[]');

    if (!distinctMovies.includes(movieId)) {
      distinctMovies.push(movieId);
      localStorage.setItem('distinctMoviesOpened', JSON.stringify(distinctMovies));
      localStorage.setItem('movieInteractionCount', distinctMovies.length.toString());
    }
  }, [movieId]);

  return null;
};

export default MovieInteractionTracker;
