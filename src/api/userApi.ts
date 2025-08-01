import { User } from "firebase/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export interface StatsResponse {
  totalUsers: number;
  totalRatings: number;
  averageRating: number;
}

export const fetchStats = async (): Promise<StatsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
};

export const fetchUserProfile = async (
  userId: string,
  firebaseUser: User | null
) => {
  if (!firebaseUser) {
    throw new Error("User not authenticated");
  }

  try {
    const token = await firebaseUser.getIdToken();

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (
  userId: string,
  data: { name?: string; bio?: string },
  firebaseUser: User | null
) => {
  if (!firebaseUser) {
    throw new Error("User not authenticated");
  }

  try {
    const token = await firebaseUser.getIdToken();

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};
