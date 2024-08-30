import { db } from "./firebase";
import { doc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { Category } from "@/types";

export const addNewCategory = async (
  id: string,
  name: string
): Promise<void> => {
  try {
    const categoryRef = doc(db, "categories", id);
    const newCategory: Category = {
      id,
      name,
      created_at: serverTimestamp() as Timestamp,
      updated_at: serverTimestamp() as Timestamp,
    };
    await setDoc(categoryRef, newCategory);
  } catch (error) {
    console.error("Error adding new category: ", error);
    throw error;
  }
};
