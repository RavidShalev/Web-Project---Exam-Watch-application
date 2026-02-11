import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import P2PPeer from "@/app/models/P2PPeer";

/**
 * P2P Peers API - Signaling Server for WebRTC P2P connections
 * 
 * This endpoint acts as a signaling server to help peers discover each other.
 * The actual communication happens directly between peers (P2P).
 * 
 * GET - Fetch all active peers for an exam
 * POST - Register a new peer
 * DELETE - Unregister a peer
 */

// GET - Fetch all active peers for an exam
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    await connectDB();
    const { examId } = await params;

    // Update the query to only get active peers seen in last 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    
    const peers = await P2PPeer.find({
      examId,
      isActive: true,
      lastSeen: { $gte: twoMinutesAgo },
    }).lean();

    // Map to the expected format
    const formattedPeers = peers.map((peer) => ({
      oderId: peer.supervisorId.toString(),
      odername: peer.supervisorName,
      odernumber: peer.supervisorIdNumber,
      peerId: peer.peerId,
    }));

    return NextResponse.json({
      success: true,
      peers: formattedPeers,
    });
  } catch (error) {
    console.error("Error fetching P2P peers:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch peers" },
      { status: 500 }
    );
  }
}

// POST - Register a new peer or update existing
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    await connectDB();
    const { examId } = await params;
    const body = await request.json();
    const { peerId, supervisorId, supervisorName, supervisorIdNumber } = body;

    if (!peerId || !supervisorId || !supervisorName) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Upsert - create or update the peer
    const peer = await P2PPeer.findOneAndUpdate(
      { examId, supervisorId },
      {
        examId,
        supervisorId,
        supervisorName,
        supervisorIdNumber,
        peerId,
        lastSeen: new Date(),
        isActive: true,
      },
      { upsert: true, new: true }
    );

    // Return all active peers for this exam
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const peers = await P2PPeer.find({
      examId,
      isActive: true,
      lastSeen: { $gte: twoMinutesAgo },
    }).lean();

    const formattedPeers = peers.map((p) => ({
      oderId: p.supervisorId.toString(),
      odername: p.supervisorName,
      odernumber: p.supervisorIdNumber,
      peerId: p.peerId,
    }));

    return NextResponse.json({
      success: true,
      peer: {
        oderId: peer.supervisorId.toString(),
        odername: peer.supervisorName,
        odernumber: peer.supervisorIdNumber,
        peerId: peer.peerId,
      },
      peers: formattedPeers,
    });
  } catch (error) {
    console.error("Error registering P2P peer:", error);
    return NextResponse.json(
      { success: false, message: "Failed to register peer" },
      { status: 500 }
    );
  }
}

// DELETE - Unregister a peer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    await connectDB();
    const { examId } = await params;
    const body = await request.json();
    const { supervisorId } = body;

    if (!supervisorId) {
      return NextResponse.json(
        { success: false, message: "Missing supervisorId" },
        { status: 400 }
      );
    }

    // Mark as inactive instead of deleting
    await P2PPeer.findOneAndUpdate(
      { examId, supervisorId },
      { isActive: false }
    );

    return NextResponse.json({
      success: true,
      message: "Peer unregistered successfully",
    });
  } catch (error) {
    console.error("Error unregistering P2P peer:", error);
    return NextResponse.json(
      { success: false, message: "Failed to unregister peer" },
      { status: 500 }
    );
  }
}

// PATCH - Update peer's lastSeen (heartbeat)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    await connectDB();
    const { examId } = await params;
    const body = await request.json();
    const { supervisorId } = body;

    if (!supervisorId) {
      return NextResponse.json(
        { success: false, message: "Missing supervisorId" },
        { status: 400 }
      );
    }

    await P2PPeer.findOneAndUpdate(
      { examId, supervisorId },
      { lastSeen: new Date(), isActive: true }
    );

    return NextResponse.json({
      success: true,
      message: "Heartbeat updated",
    });
  } catch (error) {
    console.error("Error updating heartbeat:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update heartbeat" },
      { status: 500 }
    );
  }
}
