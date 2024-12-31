import { List, ListItem, ListIcon, Text } from "@nextui-org/react";
import { FamilyIcon, MembersIcon, SubscriptionIcon, AIIcon, NotificationIcon, AnalyticsIcon, SecurityIcon } from "@/icons";

interface SidebarNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function SidebarNavigation({ activeSection, onSectionChange }: SidebarNavigationProps) {
  const sections = [
    { name: "Family Details", icon: FamilyIcon },
    { name: "Members", icon: MembersIcon },
    { name: "Subscription", icon: SubscriptionIcon },
    { name: "AI Settings", icon: AIIcon },
    { name: "Notifications", icon: NotificationIcon },
    { name: "Analytics", icon: AnalyticsIcon },
    { name: "Security & Privacy", icon: SecurityIcon },
  ];

  return (
    <List selectionMode="single" selectedKeys={[activeSection]}>
      {sections.map((section) => (
        <ListItem key={section.name} onClick={() => onSectionChange(section.name)}>
          <ListIcon>
            <section.icon />
          </ListIcon>
          <Text>{section.name}</Text>
        </ListItem>
      ))}
    </List>
  );
} 