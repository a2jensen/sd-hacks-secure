import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseStorage } from "./firebase";

export async function uploadIncidentPhoto(file: File): Promise<string> {
  const filename = `incidents/${Date.now()}-${file.name}`;
  const storageRef = ref(getFirebaseStorage(), filename);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
