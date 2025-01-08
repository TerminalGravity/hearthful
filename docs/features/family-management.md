# Family Management

The Family Management feature allows users to create, join, and manage family groups within Hearthful.

## Overview

Family groups are the core organizational unit in Hearthful, enabling members to:
- Create and manage family groups
- Invite and manage family members
- Set roles and permissions
- Share events, photos, and recipes within the family

## Features

### Family Creation
- Create new family groups
- Set family name and description
- Upload family profile picture
- Configure privacy settings

### Member Management
- Invite new members via email or link
- Assign member roles (Admin, Member, Guest)
- Remove members
- Transfer ownership

### Roles and Permissions

| Role  | Permissions |
|-------|-------------|
| Admin | - Manage family settings<br>- Invite/remove members<br>- Create/edit events<br>- Manage all content |
| Member | - View family content<br>- Create events<br>- Upload photos<br>- Share recipes |
| Guest | - View family content<br>- RSVP to events<br>- Limited interaction |

### Family Settings
- Privacy controls
- Notification preferences
- Content sharing rules
- Member visibility options

## Usage Examples

### Creating a Family Group

```typescript
// Using the Family Management UI
1. Navigate to Families page
2. Click "Create New Family"
3. Fill in family details:
   - Name
   - Description
   - Profile Picture
4. Configure initial settings
5. Submit to create

// Using the API
const response = await fetch('/api/families', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Smith Family',
    description: 'Our wonderful family group',
    privacy: 'private'
  })
});
```

### Inviting Members

```typescript
// Using the Member Invitation UI
1. Open family settings
2. Click "Invite Members"
3. Enter email addresses
4. Set roles
5. Send invitations

// Using the API
const response = await fetch('/api/families/${familyId}/invites', {
  method: 'POST',
  body: JSON.stringify({
    emails: ['member@example.com'],
    role: 'Member'
  })
});
```

## Best Practices

1. **Family Creation**
   - Use descriptive family names
   - Add a meaningful description
   - Set appropriate privacy levels
   - Upload a recognizable profile picture

2. **Member Management**
   - Assign roles based on involvement
   - Regularly review member list
   - Remove inactive members
   - Keep admin count minimal

3. **Privacy**
   - Review privacy settings regularly
   - Control content visibility
   - Protect member information
   - Monitor sharing settings

## Common Issues

1. **Invitation Problems**
   - Check email accuracy
   - Verify invitation permissions
   - Ensure valid email format
   - Check spam folders

2. **Access Issues**
   - Verify member role
   - Check privacy settings
   - Confirm membership status
   - Review blocked status

## Related Features

- [Event Planning](events.md)
- [Photo Sharing](photos.md)
- [Recipe Management](recipes.md)

## Technical Details

### Data Model

```typescript
interface Family {
  id: string;
  name: string;
  description?: string;
  profilePicture?: string;
  privacy: 'public' | 'private';
  createdAt: Date;
  updatedAt: Date;
}

interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: 'Admin' | 'Member' | 'Guest';
  joinedAt: Date;
  status: 'active' | 'inactive' | 'blocked';
}
```

### State Management

The family management feature uses React Query for state management:
```typescript
const { data: family } = useQuery(['family', familyId], 
  () => fetchFamily(familyId)
);

const { mutate: updateFamily } = useMutation(
  (data) => updateFamily(familyId, data),
  {
    onSuccess: () => {
      queryClient.invalidateQueries(['family', familyId]);
    },
  }
);
```

## Security Considerations

1. **Access Control**
   - Role-based access control
   - Member verification
   - Content permissions
   - Invitation validation

2. **Data Protection**
   - Encrypted storage
   - Secure transmission
   - Privacy compliance
   - Regular audits

## Future Enhancements

1. **Planned Features**
   - Family tree visualization
   - Advanced role customization
   - Bulk member management
   - Family merging capabilities

2. **Improvements**
   - Enhanced privacy controls
   - Better member organization
   - Improved invitation system
   - More customization options 

3. **Social Features**
   - Family feed
   - Family chat
   - Family calendar
   - Family photos
   - Family recipes

4. **Social Media Integration**
   - Facebook integration
   - Instagram integration
   - Twitter integration
   - LinkedIn integration
