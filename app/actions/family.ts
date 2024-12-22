export async function createFamily(data: {
  name: string;
  description?: string;
}) {
  try {
    const response = await fetch("/api/families", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create family");
    }

    return response.json();
  } catch (error) {
    console.error("[CREATE_FAMILY_ERROR]", error);
    throw error;
  }
}

export async function getFamilies() {
  try {
    const response = await fetch("/api/families");

    if (!response.ok) {
      throw new Error("Failed to fetch families");
    }

    return response.json();
  } catch (error) {
    console.error("[GET_FAMILIES_ERROR]", error);
    throw error;
  }
}

export async function addFamilyMember(familyId: string, data: {
  email: string;
  role?: "ADMIN" | "MEMBER";
}) {
  try {
    const response = await fetch(`/api/families/${familyId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to add family member");
    }

    return response.json();
  } catch (error) {
    console.error("[ADD_FAMILY_MEMBER_ERROR]", error);
    throw error;
  }
}

export async function getFamilyMembers(familyId: string) {
  try {
    const response = await fetch(`/api/families/${familyId}/members`);

    if (!response.ok) {
      throw new Error("Failed to fetch family members");
    }

    return response.json();
  } catch (error) {
    console.error("[GET_FAMILY_MEMBERS_ERROR]", error);
    throw error;
  }
}

export async function removeFamilyMember(familyId: string, memberId: string) {
  try {
    const response = await fetch(`/api/families/${familyId}/members`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memberId }),
    });

    if (!response.ok) {
      throw new Error("Failed to remove family member");
    }
  } catch (error) {
    console.error("[REMOVE_FAMILY_MEMBER_ERROR]", error);
    throw error;
  }
} 