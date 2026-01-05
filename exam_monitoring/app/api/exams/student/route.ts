import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "../../../lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url); // Take the URL of the request and extract query parameters
  const studentId = searchParams.get('studentId'); // Get the value of studentId from the query string

  if (!studentId) {
    return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
  }

  try {
    await dbConnect();
    

    if (!mongoose.connection.db) {
        throw new Error("MongoDB connection error");
    }
    const collection = mongoose.connection.db.collection("exams");

    const searchValues: any[] = [studentId];
    
    if (mongoose.Types.ObjectId.isValid(studentId)) {
        searchValues.push(new mongoose.Types.ObjectId(studentId));
    }

    const exams = await collection.find({
        students: { $in: searchValues }
    }).sort({ date: 1 }).toArray(); 

    return NextResponse.json({ success: true, data: exams });

  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}