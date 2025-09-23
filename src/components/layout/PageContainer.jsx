import React from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

const PageContainer = ({ children, className }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <div className={cn(
      'min-h-screen w-full pt-20', // pt-20 accounts for the navbar height
      isHomePage ? 'pt-0' : '', // Remove top padding on home page if needed
      className
    )}>
      {children}
    </div>
  );
};

export default PageContainer;
