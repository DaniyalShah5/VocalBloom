
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext'; 

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const { user } = useAuth();
  const socket = useSocket(); 
  const [therapistPendingRequests, setTherapistPendingRequests] = useState([]);
  const [request, setRequest] = useState(null);

  useEffect(() => {
    if (!socket || !user) return;

    if (user.role === "therapist") {
      
      fetchInitialRequests();

      const handleNewSessionRequest = (payload) => {
        console.log('THERAPIST: Received new_session_request:', payload);
        
        setTherapistPendingRequests(prevRequests => {
          if (prevRequests.some(req => req._id === payload.requestId)) {
            return prevRequests;
          }
          return [
            {
              _id: payload.requestId,
              child: payload.child,
              status: payload.status,
              requestedAt: payload.requestedAt,
              description: payload.description,
            },
            ...prevRequests 
          ];
        });
      };

      const handleSessionRequestDeleted = (payload) => {
        console.log('THERAPIST: Received session_request_deleted:', payload);
        setTherapistPendingRequests(prevRequests =>
          prevRequests.filter(req => req._id !== payload.requestId)
        );
      };

      socket.on("new_session_request", handleNewSessionRequest);
      socket.on("session_request_deleted", handleSessionRequestDeleted);

      return () => {
        socket.off("new_session_request", handleNewSessionRequest);
        socket.off("session_request_deleted", handleSessionRequestDeleted);
      };
    }

    const handleSessionRequestUpdated = (payload) => {
      console.log('CLIENT: Received session_request_updated:', payload);

      if (user.role === "therapist") {
        setTherapistPendingRequests(prevRequests =>
          prevRequests.filter(req => req._id !== payload.requestId) 
        );
        setRequest(prevActiveRequest => {
          if (prevActiveRequest && prevActiveRequest._id === payload.requestId) {
            return {
              ...prevActiveRequest,
              status: payload.status,
              acceptedAt: payload.acceptedAt,
              declinedAt: payload.declinedAt,
              endedAt: payload.endedAt,
              therapist: payload.therapist,
            };
          } else if (["accepted", "in_progress"].includes(payload.status) && payload.therapist === user._id) {
            return prevActiveRequest;
          }
          return prevActiveRequest;
        });
      } else { 
        setRequest((prevRequest) => {
          if (prevRequest && prevRequest._id === payload.requestId) {
            return {
              ...prevRequest,
              status: payload.status,
              acceptedAt: payload.acceptedAt,
              declinedAt: payload.declinedAt,
              endedAt: payload.endedAt,
              therapist: payload.therapist,
            };
          }
          return prevRequest;
        });
      }
    };

    socket.on("session_request_updated", handleSessionRequestUpdated);
    return () => {
      socket.off("session_request_updated", handleSessionRequestUpdated);
    };
  }, [socket, user]);

  const fetchInitialRequests = async () => {
    try {
      const response = await fetch('/api/session-requests');
      
      if (response.ok) {
        const requests = await response.json();
        setTherapistPendingRequests(requests);
      }
    } catch (error) {
      console.error('Error fetching initial requests:', error);
    }
  };

  const value = {
    therapistPendingRequests,
    setTherapistPendingRequests,
    request,
    setRequest,
    pendingRequestsCount: therapistPendingRequests.length,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};