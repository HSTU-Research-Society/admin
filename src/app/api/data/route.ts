import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export async function GET(req: NextRequest) {
  try {
    // Read: Get all items from the 'items' collection
    const querySnapshot = await getDocs(collection(db, "items"));
    
    const items: any[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Create: Add a new item
    const docRef = await addDoc(collection(db, "items"), {
      ...data,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      message: "Item created successfully",
      id: docRef.id 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Missing item ID" }, { status: 400 });
    }

    const data = await req.json();
    const docRef = doc(db, "items", id);

    // Update document
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ message: "Item updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Missing item ID" }, { status: 400 });
    }

    const docRef = doc(db, "items", id);

    // Delete document
    await deleteDoc(docRef);

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
