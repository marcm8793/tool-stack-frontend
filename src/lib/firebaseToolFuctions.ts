import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { DevTool } from "@/types";

export const addNewTool = async (
  toolData: Omit<DevTool, "id" | "like_count">
) => {
  try {
    const toolsRef = collection(db, "tools");
    const newTool = {
      ...toolData,
      like_count: 0,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };
    const docRef = await addDoc(toolsRef, newTool);
    return docRef.id;
  } catch (error) {
    console.error("Error adding new tool: ", error);
    throw error;
  }
};
