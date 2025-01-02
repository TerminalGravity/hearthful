import FamilySettingsPage from "@/components/settings/FamilySettingsPage";
import { getFamilyById } from "@/lib/db";

export default async function SettingsPage({ params }: { params: { familyId: string } }) {
  const family = await getFamilyById(params.familyId);

  if (!family) {
    return <div>Family not found.</div>;
  }

  return <FamilySettingsPage family={family} />;
} 