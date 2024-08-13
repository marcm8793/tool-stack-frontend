import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  increment,
  runTransaction,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { Like } from "@/types/index";

export const likeTool = async (userId: string, toolId: string) => {
  const likeId = `${userId}_${toolId}`;
  const likeRef = doc(db, "likes", likeId);
  const toolRef = doc(db, "tools", toolId);

  await runTransaction(db, async (transaction) => {
    const toolDoc = await transaction.get(toolRef);
    if (!toolDoc.exists()) {
      throw "Tool does not exist!";
    }

    const newLike: Like = {
      id: likeId,
      user_id: userId,
      tool_id: toolId,
      liked_at: Timestamp.now(),
    };

    transaction.set(likeRef, newLike);

    transaction.update(toolRef, {
      like_count: increment(1),
    });
  });
};

export const unlikeTool = async (userId: string, toolId: string) => {
  const likeId = `${userId}_${toolId}`;
  const likeRef = doc(db, "likes", likeId);
  const toolRef = doc(db, "tools", toolId);

  await runTransaction(db, async (transaction) => {
    const toolDoc = await transaction.get(toolRef);
    if (!toolDoc.exists()) {
      throw "Tool does not exist!";
    }

    transaction.delete(likeRef);

    transaction.update(toolRef, {
      like_count: increment(-1),
    });
  });
};

export const getLikedTools = async (userId: string) => {
  const likesRef = collection(db, "likes");
  const q = query(likesRef, where("user_id", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data().tool_id);
};
