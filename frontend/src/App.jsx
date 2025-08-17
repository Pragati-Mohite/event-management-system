import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import MyTickets from './pages/MyTickets';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

// Organizer pages
import OrganizerEvents from './pages/organizer/Events';
import CreateEvent from './pages/organizer/CreateEvent';
import EditEvent from './pages/organizer/EditEvent';
import TicketScanner from './pages/organizer/TicketScanner';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Auth routes (no layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Main routes (with layout) */}
            <Route path="/" element={
              <Layout>
                <Home />
              </Layout>
            } />
            
            <Route path="/events" element={
              <Layout>
                <Events />
              </Layout>
            } />
            
            <Route path="/events/:id" element={
              <Layout>
                <EventDetails />
              </Layout>
            } />
            
            {/* Protected routes */}
            <Route path="/my-tickets" element={
              <ProtectedRoute>
                <Layout>
                  <MyTickets />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Organizer routes */}
            <Route path="/organizer/events" element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <Layout>
                  <OrganizerEvents />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/organizer/create-event" element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <Layout>
                  <CreateEvent />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/organizer/edit-event/:id" element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <Layout>
                  <EditEvent />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/organizer/scanner" element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <Layout>
                  <TicketScanner />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* 404 route */}
            <Route path="*" element={
              <Layout>
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-4">Page not found</p>
                    <a href="/" className="text-primary-600 hover:text-primary-500">
                      Go back home
                    </a>
                  </div>
                </div>
              </Layout>
            } />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
