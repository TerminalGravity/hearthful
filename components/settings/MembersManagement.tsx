import { useState, useEffect } from "react";
import { Button, Table, Avatar, Badge, Modal } from "@nextui-org/react";
import CreateMemberModal from "../members/CreateMemberModal";
import EditMemberModal from "../families/EditMemberModal";
import { toast } from "sonner";

interface MembersManagementProps {
  familyId: string;
}

export default function MembersManagement({ familyId }: MembersManagementProps) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/families/${familyId}/members`);
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      toast.error("Failed to load members.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [familyId]);

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setShowEditModal(true);
  };

  const handleRemove = async (memberId: string) => {
    try {
      const res = await fetch(`/api/families/${familyId}/members/${memberId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to remove member.");
      }

      setMembers(members.filter((member) => member.id !== memberId));
      toast.success("Member removed successfully.");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while removing the member.");
    }
  };

  const handleUpdateMember = (updatedMember: FamilyMember) => {
    setMembers(members.map((m) => (m.id === updatedMember.id ? updatedMember : m)));
    toast.success("Member updated successfully.");
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onPress={() => setShowCreateModal(true)} color="primary">
          Add Member
        </Button>
      </div>
      <Table bordered shadow={false} hoverable aria-label="Members Table" loading={isLoading}>
        <Table.Header>
          <Table.Column>Avatar</Table.Column>
          <Table.Column>Name</Table.Column>
          <Table.Column>Email</Table.Column>
          <Table.Column>Role</Table.Column>
          <Table.Column>Actions</Table.Column>
        </Table.Header>
        <Table.Body>
          {members.map((member) => (
            <Table.Row key={member.id}>
              <Table.Cell>
                <Avatar src={member.avatarUrl} name={member.name} />
              </Table.Cell>
              <Table.Cell>{member.name}</Table.Cell>
              <Table.Cell>{member.email}</Table.Cell>
              <Table.Cell>
                <Badge color={member.role === "ADMIN" ? "error" : "primary"}>{member.role}</Badge>
              </Table.Cell>
              <Table.Cell>
                <Button size="sm" onPress={() => handleEdit(member)} color="secondary">
                  Edit
                </Button>
                <Button
                  size="sm"
                  color="error"
                  onPress={() => handleRemove(member.id)}
                  className="ml-2"
                  disabled={member.role === "ADMIN"}
                >
                  Remove
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      {/* Create Member Modal */}
      <CreateMemberModal
        showModal={showCreateModal}
        setShowModal={setShowCreateModal}
        familyId={familyId}
        onMemberAdded={fetchMembers}
      />

      {/* Edit Member Modal */}
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onSave={handleUpdateMember}
          onClose={() => setShowEditModal(false)}
          isOpen={showEditModal}
        />
      )}
    </div>
  );
} 