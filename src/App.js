import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import RoleBasedRoutes from './components/RoleBasedRoutes';

function App() {
  return (
    <BrowserRouter>
      <div>
        <RoleBasedRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;