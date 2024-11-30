// In your backend handler, e.g., /api/updateProfile.js

import { getSession } from 'next-auth/react';
import { updateUser } from '@/services/userService'; // Assume a function to update user in DB

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const { userName, image } = req.body;

      // Assume updateUser function updates user info in DB
      const updatedUser = await updateUser(session.user.id, { userName, image });

      if (updatedUser) {
        res.status(200).json({ success: true, imageUrl: updatedUser.imageUrl });
      } else {
        res.status(500).json({ error: 'Error updating user' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
