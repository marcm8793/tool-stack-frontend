import { db, storage } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { NewToolData } from "@/types";

export const addNewTool = async (toolData: NewToolData) => {
  try {
    let logo_url = toolData.logo_url;

    if (logo_url) {
      // Fetch the image from the provided URL
      const response = await fetch(logo_url);
      const blob = await response.blob();

      // Generate a unique filename
      const filename = `tool-logos/${Date.now()}_${toolData.name
        .replace(/\s+/g, "-")
        .toLowerCase()}`;

      // Upload the image to Firebase Storage
      const storageRef = ref(storage, filename);
      const snapshot = await uploadBytes(storageRef, blob);

      // Get the download URL of the uploaded image
      logo_url = await getDownloadURL(snapshot.ref);
    }

    // Add tool data to Firestore
    const toolsRef = collection(db, "tools");
    const newTool = {
      ...toolData,
      logo_url, // This will be the Firebase Storage URL
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
