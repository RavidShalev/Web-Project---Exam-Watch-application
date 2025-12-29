export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "../../lib/db";
import User from "../../models/Users";



// API Route: POST /api/login
export async function POST(req: Request) {
  try {
    await dbConnect();

    // reading the data that has been sent from the frontend (idNumber, password)
    const { idNumber, password } = await req.json();
    
    console.log("dbConnected");
    


    // checking if the user doesn't exist or the db doesn't match what the user typed
    if (!idNumber || !password ) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }
    const cleanIdNumber = idNumber.trim();
    const cleanPassword = password.trim();
    
    // searching the user from the idNumber
    const user = await User.findOne({ idNumber: cleanIdNumber });

    if (!user || user.password !== cleanPassword) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    // if no errors return to the user the information
    return NextResponse.json({
      _id: user._id.toString(),
      idNumber: user.idNumber,
      role: user.role,
    });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Unknown server error" },
      { status: 500 }
    );
  }
}
