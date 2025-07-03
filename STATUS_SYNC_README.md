# Status Synchronization System

## Overview

The TogetherCare platform uses a dual-status system to manage caregiver approval:

1. **User Collection**: `status` field (pending/approved/rejected/active)
2. **Caregiver Collection**: `isVerified` field (true/false)

## Status Flow

### New Caregiver Registration
1. User registers as caregiver
2. **User.status** = `'pending'` (default for caregivers)
3. **Caregiver.isVerified** = `false` (default)
4. Admin reviews application

### Admin Approval
1. Admin clicks "Approve"
2. **User.status** = `'approved'`
3. **Caregiver.isVerified** = `true`
4. Email notification sent to caregiver
5. Caregiver can now login

### Admin Rejection
1. Admin clicks "Reject"
2. **User.status** = `'rejected'`
3. **Caregiver.isVerified** = `false`
4. Email notification sent to caregiver
5. Caregiver cannot login

## Login Authentication Logic

The login system checks both fields for caregivers:

```javascript
if (role === 'caregiver') {
  if (user.status === 'rejected') {
    return 'Your caregiver application has been rejected...';
  }
  
  if (user.status !== 'approved') {
    return 'Caregiver not yet approved by admin';
  }

  // Double-check with Caregiver collection
  const caregiverProfile = await Caregiver.findOne({ user: user._id });
  if (!caregiverProfile || !caregiverProfile.isVerified) {
    return 'Caregiver verification incomplete...';
  }
}
```

## Database Schema

### User Collection
```javascript
{
  username: String,
  email: String,
  password: String,
  role: ['careSeeker', 'caregiver', 'admin'],
  status: ['pending', 'approved', 'rejected', 'active'],
  phone: String,
  // ... other fields
}
```

### Caregiver Collection
```javascript
{
  user: ObjectId (ref: 'User'),
  fullName: String,
  isVerified: Boolean, // Synchronized with User.status
  // ... other caregiver-specific fields
}
```

## Default Status Values

- **Care Seekers**: `status: 'active'` (can login immediately)
- **Caregivers**: `status: 'pending'` (must wait for admin approval)
- **Admins**: `status: 'active'` (always active)

## Migration Script

To fix existing data inconsistencies, run:

```bash
cd ICSPROJECT1/backend
node fixStatusSync.js
```

This script will:
1. Find all caregivers with mismatched status
2. Update `isVerified` to match `User.status`
3. Set new caregivers to `pending` status
4. Verify the synchronization

## API Endpoints

### Admin Routes
- `PUT /api/admin/approve-caregiver/:id` - Approves caregiver
- `PUT /api/admin/reject-caregiver/:id` - Rejects caregiver
- `GET /api/admin/pending-caregivers` - Lists pending caregivers

### Auth Routes
- `POST /api/auth/login` - Login with status checks
- `POST /api/auth/register` - Registration with proper defaults

## Frontend Handling

### Login Flow
1. User attempts login
2. If caregiver and not approved → redirect to confirmation page
3. If caregiver and rejected → show rejection message
4. If approved → proceed to dashboard

### Confirmation Page
- Shows different messages for pending vs rejected status
- Provides contact support option for rejected applications

## Troubleshooting

### Common Issues

1. **Caregiver can't login despite being approved**
   - Check if `User.status === 'approved'`
   - Check if `Caregiver.isVerified === true`
   - Run migration script to fix inconsistencies

2. **Admin approval not working**
   - Verify both User and Caregiver collections are updated
   - Check email sending functionality
   - Ensure proper error handling

3. **Status mismatch between collections**
   - Run the migration script: `node fixStatusSync.js`
   - Check admin approval/rejection routes
   - Verify database transactions

### Verification Commands

```javascript
// Check User status
db.users.find({role: 'caregiver'}, {username: 1, status: 1})

// Check Caregiver verification
db.caregivers.find({}, {fullName: 1, isVerified: 1})

// Find mismatches
db.users.aggregate([
  { $match: { role: 'caregiver' } },
  { $lookup: { from: 'caregivers', localField: '_id', foreignField: 'user', as: 'caregiver' } },
  { $unwind: '$caregiver' },
  { $project: {
    username: 1,
    userStatus: '$status',
    caregiverVerified: '$caregiver.isVerified'
  }}
])
```

## Security Considerations

1. **Status validation**: Always check both User.status and Caregiver.isVerified
2. **Admin-only access**: Approval/rejection routes require admin authentication
3. **Email notifications**: Users are notified of status changes
4. **Audit trail**: Status changes are logged with timestamps

## Future Enhancements

1. **Status history**: Track all status changes with timestamps
2. **Bulk operations**: Allow admin to approve/reject multiple caregivers
3. **Status reasons**: Add reason field for rejections
4. **Auto-approval**: Option to auto-approve based on criteria 