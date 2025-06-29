
import React from 'react';
import { useParams } from 'react-router-dom';
import InteractiveSession from './InteractiveSession';

const InteractiveSessionWrapper = () => {
  const { moduleId } = useParams();
  return <InteractiveSession moduleId={moduleId} />;
};

export default InteractiveSessionWrapper;
