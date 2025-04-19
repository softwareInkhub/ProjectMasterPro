import React, { createContext, useContext, useEffect, useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define event types matching the server's EventType enum
export enum EventType {
  COMPANY_CREATED = 'COMPANY_CREATED',
  COMPANY_UPDATED = 'COMPANY_UPDATED',
  COMPANY_DELETED = 'COMPANY_DELETED',
  
  DEPARTMENT_CREATED = 'DEPARTMENT_CREATED',
  DEPARTMENT_UPDATED = 'DEPARTMENT_UPDATED',
  DEPARTMENT_DELETED = 'DEPARTMENT_DELETED',
  
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  
  TEAM_CREATED = 'TEAM_CREATED',
  TEAM_UPDATED = 'TEAM_UPDATED',
  TEAM_DELETED = 'TEAM_DELETED',
  
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  PROJECT_DELETED = 'PROJECT_DELETED',
  
  EPIC_CREATED = 'EPIC_CREATED',
  EPIC_UPDATED = 'EPIC_UPDATED',
  EPIC_DELETED = 'EPIC_DELETED',
  
  STORY_CREATED = 'STORY_CREATED',
  STORY_UPDATED = 'STORY_UPDATED',
  STORY_DELETED = 'STORY_DELETED',
  
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_DELETED = 'TASK_DELETED',
  
  LOCATION_CREATED = 'LOCATION_CREATED',
  LOCATION_UPDATED = 'LOCATION_UPDATED',
  LOCATION_DELETED = 'LOCATION_DELETED',
  
  DEVICE_CREATED = 'DEVICE_CREATED',
  DEVICE_UPDATED = 'DEVICE_UPDATED',
  DEVICE_DELETED = 'DEVICE_DELETED',
}

// WebSocket message interface
interface WebSocketMessage {
  type: EventType;
  payload: any;
}

interface WebSocketContextType {
  connected: boolean;
  lastMessage: WebSocketMessage | null;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const newSocket = new WebSocket(wsUrl);
    
    newSocket.onopen = () => {
      console.log("WebSocket connection established");
      setConnected(true);
    };
    
    newSocket.onclose = () => {
      console.log("WebSocket connection closed");
      setConnected(false);
      
      // Try to reconnect after a delay
      setTimeout(() => {
        setSocket(null); // This will trigger the effect to run again and reconnect
      }, 5000);
    };
    
    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    newSocket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);
        
        // Handle different event types
        handleWebSocketMessage(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    
    setSocket(newSocket);
    
    // Clean up on unmount
    return () => {
      if (newSocket && newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }, [socket === null]); // Only reconnect when socket is null
  
  const handleWebSocketMessage = (message: WebSocketMessage) => {
    console.log("Received WebSocket message:", message);
    
    // Invalidate queries based on the message type
    switch (message.type) {
      case EventType.COMPANY_CREATED:
      case EventType.COMPANY_UPDATED:
      case EventType.COMPANY_DELETED:
        queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
        break;
        
      case EventType.DEPARTMENT_CREATED:
      case EventType.DEPARTMENT_UPDATED:
      case EventType.DEPARTMENT_DELETED:
        queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
        break;
        
      case EventType.USER_CREATED:
      case EventType.USER_UPDATED:
      case EventType.USER_DELETED:
        queryClient.invalidateQueries({ queryKey: ['/api/users'] });
        break;
        
      case EventType.TEAM_CREATED:
      case EventType.TEAM_UPDATED:
      case EventType.TEAM_DELETED:
        queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
        toast({
          title: "Team Updated",
          description: "Team information has been updated",
        });
        break;
        
      case EventType.PROJECT_CREATED:
      case EventType.PROJECT_UPDATED:
      case EventType.PROJECT_DELETED:
        // Invalidate projects collection
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
        
        // If we have a specific project ID, invalidate that specific project
        if (message.payload?.id) {
          queryClient.invalidateQueries({ queryKey: [`/api/projects/${message.payload.id}`] });
          console.log(`Invalidating specific project: ${message.payload.id}`);
        }
        
        // Show appropriate toast for status changes
        if (message.payload?.status) {
          toast({
            title: `Project Status: ${message.payload.status}`,
            description: message.payload.status === 'COMPLETED' 
              ? 'Project has been marked as completed!' 
              : `Project status changed to ${message.payload.status.toLowerCase()}`,
            variant: message.payload.status === 'COMPLETED' ? "destructive" : "default",
          });
        } else {
          toast({
            title: "Project Updated",
            description: "Project information has been updated",
          });
        }
        break;
        
      case EventType.EPIC_CREATED:
      case EventType.EPIC_UPDATED:
      case EventType.EPIC_DELETED:
        // Invalidate epics collection
        queryClient.invalidateQueries({ queryKey: ['/api/epics'] });
        
        // If we have a specific epic ID, invalidate that specific epic
        if (message.payload?.id) {
          queryClient.invalidateQueries({ queryKey: [`/api/epics/${message.payload.id}`] });
          console.log(`Invalidating specific epic: ${message.payload.id}`);
        }
        
        // If we have a project ID, invalidate that specific project
        if (message.payload?.projectId) {
          queryClient.invalidateQueries({ queryKey: [`/api/projects/${message.payload.projectId}`] });
          console.log(`Invalidating parent project: ${message.payload.projectId}`);
        }
        
        // Also invalidate all projects since epic status changes affect them
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
        
        // Show appropriate toast for status changes
        if (message.payload?.status) {
          toast({
            title: `Epic Status: ${message.payload.status}`,
            description: message.payload.status === 'COMPLETED' 
              ? 'Epic has been marked as completed! Parent project progress updated.' 
              : `Epic status changed to ${message.payload.status.toLowerCase()}`,
            variant: message.payload.status === 'COMPLETED' ? "destructive" : "default",
          });
        } else {
          toast({
            title: "Epic Updated",
            description: "Epic information has been updated",
          });
        }
        break;
        
      case EventType.STORY_CREATED:
      case EventType.STORY_UPDATED:
      case EventType.STORY_DELETED:
        // Invalidate stories collection
        queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
        
        // If we have a specific story ID, invalidate that specific story
        if (message.payload?.id) {
          queryClient.invalidateQueries({ queryKey: [`/api/stories/${message.payload.id}`] });
          console.log(`Invalidating specific story: ${message.payload.id}`);
        }
        
        // If we have an epic ID, invalidate that specific epic
        if (message.payload?.epicId) {
          queryClient.invalidateQueries({ queryKey: [`/api/epics/${message.payload.epicId}`] });
          console.log(`Invalidating parent epic: ${message.payload.epicId}`);
        }
        
        // If we have a project ID, invalidate that specific project
        if (message.payload?.projectId) {
          queryClient.invalidateQueries({ queryKey: [`/api/projects/${message.payload.projectId}`] });
          console.log(`Invalidating parent project: ${message.payload.projectId}`);
        }
        
        // Also invalidate all epics and projects since story status changes affect them
        queryClient.invalidateQueries({ queryKey: ['/api/epics'] });
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
        
        // Show appropriate toast for status changes
        if (message.payload?.status) {
          toast({
            title: `Story Status: ${message.payload.status}`,
            description: message.payload.status === 'DONE' 
              ? 'Story has been marked as done! Parent epic progress updated.' 
              : `Story status changed to ${message.payload.status.toLowerCase()}`,
            variant: message.payload.status === 'DONE' ? "destructive" : "default",
          });
        } else {
          toast({
            title: "Story Updated",
            description: "Story information has been updated",
          });
        }
        break;
        
      case EventType.TASK_CREATED:
      case EventType.TASK_UPDATED:
      case EventType.TASK_DELETED:
        // Invalidate tasks collection
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        
        // If we have a specific task ID, invalidate that specific task
        if (message.payload?.id) {
          queryClient.invalidateQueries({ queryKey: [`/api/tasks/${message.payload.id}`] });
          console.log(`Invalidating specific task: ${message.payload.id}`);
        }
        
        // If we have a story ID, invalidate that specific story
        if (message.payload?.storyId) {
          queryClient.invalidateQueries({ queryKey: [`/api/stories/${message.payload.storyId}`] });
          console.log(`Invalidating parent story: ${message.payload.storyId}`);
        }
        
        // If we have an epic ID, invalidate that specific epic
        if (message.payload?.epicId) {
          queryClient.invalidateQueries({ queryKey: [`/api/epics/${message.payload.epicId}`] });
          console.log(`Invalidating parent epic: ${message.payload.epicId}`);
        }
        
        // If we have a project ID, invalidate that specific project
        if (message.payload?.projectId) {
          queryClient.invalidateQueries({ queryKey: [`/api/projects/${message.payload.projectId}`] });
          console.log(`Invalidating parent project: ${message.payload.projectId}`);
        }
        
        // Also invalidate all stories, epics, and projects since task status changes affect them
        queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
        queryClient.invalidateQueries({ queryKey: ['/api/epics'] });
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
        
        // Show appropriate toast for status changes
        if (message.payload?.status) {
          toast({
            title: `Task Status: ${message.payload.status}`,
            description: message.payload.status === 'DONE' 
              ? 'Task has been completed! Parent story progress updated.' 
              : `Task status changed to ${message.payload.status.toLowerCase()}`,
            variant: message.payload.status === 'DONE' ? "destructive" : "default",
          });
        } else {
          toast({
            title: "Task Updated",
            description: "Task information has been updated",
          });
        }
        break;
        
      case EventType.LOCATION_CREATED:
      case EventType.LOCATION_UPDATED:
      case EventType.LOCATION_DELETED:
        queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
        break;
        
      case EventType.DEVICE_CREATED:
      case EventType.DEVICE_UPDATED:
      case EventType.DEVICE_DELETED:
        queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
        break;
    }
  };

  return (
    <WebSocketContext.Provider value={{ connected, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};