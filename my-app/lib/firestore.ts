import {
  collection,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { Incident, RiskAssessment } from "@/types/incident";

export function subscribeToIncidents(
  callback: (incidents: Incident[]) => void
) {
  const q = query(
    collection(getFirebaseDb(), "incidents"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const incidents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Incident[];
    callback(incidents);
  });
}

export function subscribeToSuspects(
  callback: (incidents: Incident[]) => void
) {
  const q = query(
    collection(getFirebaseDb(), "incidents"),
    where("suspectVisible", "==", true),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const incidents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Incident[];
    callback(incidents);
  });
}

export async function createIncident(data: {
  latitude: number;
  longitude: number;
  photoUrl: string;
  riskAssessment: RiskAssessment;
  description?: string;
  suspectVisible?: boolean;
  suspectDescription?: string;
}) {
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
  return addDoc(collection(getFirebaseDb(), "incidents"), {
    ...clean,
    createdAt: serverTimestamp(),
  });
}
