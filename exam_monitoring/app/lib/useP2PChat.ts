"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { DataConnection } from "peerjs";

// PeerJS will be dynamically imported to avoid SSR issues
type PeerType = import("peerjs").default;

// Types for P2P messages
export type P2PMessage = {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    idNumber: string;
  };
  message: string;
  messageType: "message" | "status_update" | "emergency";
  createdAt: string;
  isP2P?: boolean; // Flag to indicate this is a P2P message
};

export type PeerInfo = {
  oderId: string;
  odername: string;
  odernumber: string;
  peerId: string;
};

type P2PDataPayload = 
  | { type: "message"; data: P2PMessage }
  | { type: "peer_list"; data: PeerInfo[] }
  | { type: "peer_join"; data: PeerInfo }
  | { type: "peer_leave"; data: { oderId: string } };

type UseP2PChatOptions = {
  examId: string;
  supervisorId: string;
  supervisorName: string;
  supervisorIdNumber: string;
  onMessage?: (message: P2PMessage) => void;
  onPeerJoin?: (peer: PeerInfo) => void;
  onPeerLeave?: (peerId: string) => void;
};

export function useP2PChat({
  examId,
  supervisorId,
  supervisorName,
  supervisorIdNumber,
  onMessage,
  onPeerJoin,
  onPeerLeave,
}: UseP2PChatOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedPeers, setConnectedPeers] = useState<PeerInfo[]>([]);
  const [myPeerId, setMyPeerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const peerRef = useRef<PeerType | null>(null);
  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
  const registeredRef = useRef(false);

  // Generate unique peer ID based on exam and supervisor
  const generatePeerId = useCallback(() => {
    return `exam_${examId}_supervisor_${supervisorId}`;
  }, [examId, supervisorId]);

  // Register this peer with the signaling server (our API)
  const registerPeer = useCallback(async (peerId: string) => {
    try {
      const res = await fetch(`/api/exams/${examId}/p2p-peers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peerId,
          supervisorId,
          supervisorName,
          supervisorIdNumber,
        }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to register peer");
      }
      
      const data = await res.json();
      return data.peers || [];
    } catch (err) {
      console.error("Error registering peer:", err);
      return [];
    }
  }, [examId, supervisorId, supervisorName, supervisorIdNumber]);

  // Unregister peer when leaving
  const unregisterPeer = useCallback(async () => {
    try {
      await fetch(`/api/exams/${examId}/p2p-peers`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supervisorId }),
      });
    } catch (err) {
      console.error("Error unregistering peer:", err);
    }
  }, [examId, supervisorId]);

  // Fetch existing peers from the signaling server
  const fetchPeers = useCallback(async () => {
    try {
      const res = await fetch(`/api/exams/${examId}/p2p-peers`);
      if (!res.ok) return [];
      
      const data = await res.json();
      return data.peers || [];
    } catch (err) {
      console.error("Error fetching peers:", err);
      return [];
    }
  }, [examId]);

  // Connect to a specific peer
  const connectToPeer = useCallback((peerId: string) => {
    if (!peerRef.current || connectionsRef.current.has(peerId)) {
      return;
    }

    const conn = peerRef.current.connect(peerId, {
      reliable: true,
      serialization: "json",
    });

    conn.on("open", () => {
      console.log(`Connected to peer: ${peerId}`);
      connectionsRef.current.set(peerId, conn);
      
      // Send our info to the new peer
      conn.send({
        type: "peer_join",
        data: {
          oderId: supervisorId,
          odername: supervisorName,
          odernumber: supervisorIdNumber,
          peerId: generatePeerId(),
        },
      } as P2PDataPayload);
    });

    conn.on("data", (data) => {
      handleIncomingData(data as P2PDataPayload);
    });

    conn.on("close", () => {
      console.log(`Disconnected from peer: ${peerId}`);
      connectionsRef.current.delete(peerId);
    });

    conn.on("error", (err) => {
      console.error(`Connection error with ${peerId}:`, err);
      connectionsRef.current.delete(peerId);
    });
  }, [supervisorId, supervisorName, supervisorIdNumber, generatePeerId]);

  // Handle incoming data from peers
  const handleIncomingData = useCallback((payload: P2PDataPayload) => {
    switch (payload.type) {
      case "message":
        onMessage?.(payload.data);
        break;
      case "peer_join":
        setConnectedPeers((prev) => {
          const exists = prev.some((p) => p.oderId === payload.data.oderId);
          if (exists) return prev;
          onPeerJoin?.(payload.data);
          return [...prev, payload.data];
        });
        break;
      case "peer_leave":
        setConnectedPeers((prev) => 
          prev.filter((p) => p.oderId !== payload.data.oderId)
        );
        onPeerLeave?.(payload.data.oderId);
        break;
      case "peer_list":
        setConnectedPeers(payload.data);
        break;
    }
  }, [onMessage, onPeerJoin, onPeerLeave]);

  // Broadcast message to all connected peers
  const broadcastMessage = useCallback((message: P2PMessage) => {
    const payload: P2PDataPayload = { type: "message", data: message };
    
    connectionsRef.current.forEach((conn) => {
      if (conn.open) {
        conn.send(payload);
      }
    });
  }, []);

  // Send a chat message via P2P
  const sendP2PMessage = useCallback((messageText: string, messageType: "message" | "emergency" = "message"): P2PMessage => {
    const message: P2PMessage = {
      _id: `p2p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: {
        _id: supervisorId,
        name: supervisorName,
        idNumber: supervisorIdNumber,
      },
      message: messageText,
      messageType,
      createdAt: new Date().toISOString(),
      isP2P: true,
    };

    // Broadcast to all peers
    broadcastMessage(message);
    
    return message;
  }, [supervisorId, supervisorName, supervisorIdNumber, broadcastMessage]);

  // Initialize PeerJS connection
  useEffect(() => {
    if (!examId || !supervisorId || !supervisorName) {
      return;
    }

    // Dynamic import of PeerJS to avoid SSR issues
    let peer: PeerType | null = null;
    let isMounted = true;

    const initPeer = async () => {
      // Dynamically import PeerJS (only works in browser)
      const { default: Peer } = await import("peerjs");
      
      if (!isMounted) return;

      const peerId = generatePeerId();
      
      // Create new Peer instance using public PeerJS server
      peer = new Peer(peerId, {
        debug: 2,
        // Using public PeerJS cloud server (free)
        // For production, consider self-hosting a PeerServer
      });

      peerRef.current = peer;

      peer.on("open", async (id) => {
        console.log("P2P: Connected with peer ID:", id);
        setMyPeerId(id);
        setIsConnected(true);
        setError(null);

        // Register with signaling server and get existing peers
        if (!registeredRef.current) {
          registeredRef.current = true;
          const existingPeers = await registerPeer(id);
          
          // Connect to all existing peers
          existingPeers.forEach((peerInfo: PeerInfo) => {
            if (peerInfo.peerId !== id) {
              connectToPeer(peerInfo.peerId);
            }
          });
          
          setConnectedPeers(existingPeers.filter((p: PeerInfo) => p.peerId !== id));
        }
      });

      // Handle incoming connections
      peer.on("connection", (conn) => {
        console.log("P2P: Incoming connection from:", conn.peer);
        
        conn.on("open", () => {
          connectionsRef.current.set(conn.peer, conn);
        });

        conn.on("data", (data) => {
          handleIncomingData(data as P2PDataPayload);
        });

        conn.on("close", () => {
          connectionsRef.current.delete(conn.peer);
        });
      });

      peer.on("error", (err) => {
        console.error("P2P Error:", err);
        setError(err.message || "P2P connection error");
        
        // Attempt to reconnect on certain errors
        if (err.type === "network" || err.type === "server-error") {
          setTimeout(() => {
            if (peerRef.current) {
              peerRef.current.reconnect();
            }
          }, 5000);
        }
      });

      peer.on("disconnected", () => {
        console.log("P2P: Disconnected from server");
        setIsConnected(false);
        
        // Try to reconnect
        setTimeout(() => {
          if (peerRef.current && !peerRef.current.destroyed) {
            peerRef.current.reconnect();
          }
        }, 3000);
      });
    };

    initPeer();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      unregisterPeer();
      connectionsRef.current.forEach((conn) => conn.close());
      connectionsRef.current.clear();
      
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      
      registeredRef.current = false;
    };
  }, [examId, supervisorId, supervisorName, generatePeerId, registerPeer, unregisterPeer, connectToPeer, handleIncomingData]);

  // Periodically refresh peer list and reconnect to new peers
  useEffect(() => {
    if (!isConnected) return;

    const refreshPeers = async () => {
      const peers = await fetchPeers();
      const myId = generatePeerId();
      
      peers.forEach((peerInfo: PeerInfo) => {
        if (peerInfo.peerId !== myId && !connectionsRef.current.has(peerInfo.peerId)) {
          connectToPeer(peerInfo.peerId);
        }
      });
      
      setConnectedPeers(peers.filter((p: PeerInfo) => p.peerId !== myId));
    };

    const interval = setInterval(refreshPeers, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, [isConnected, fetchPeers, generatePeerId, connectToPeer]);

  return {
    isConnected,
    connectedPeers,
    myPeerId,
    error,
    sendP2PMessage,
    broadcastMessage,
    peersCount: connectionsRef.current.size,
  };
}
