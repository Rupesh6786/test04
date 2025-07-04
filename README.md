# AC-Solution Firebase Project

This is a Next.js application for AC sales and services.

## Important Firebase Configuration

### Firestore vs. Firebase Storage

This project uses two key Firebase services:

1.  **Cloud Firestore:** A database for storing structured data like product details, user information, and appointments.
2.  **Cloud Storage:** A service for storing files like images, videos, and other user-generated content.

These two services have **separate security rules** that must be configured independently in the Firebase Console.

### Fixing File Upload Errors

If you encounter "Permission Denied" or "Unknown" errors when uploading images in the admin panel, it is almost always an issue with your **Firebase Storage security rules**.

Please navigate to your **Firebase Console -> Storage -> Rules** tab and update the rules to the following to allow authenticated users to upload files:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Allow read access to everyone
      allow read: if true;
      // Allow write access only to authenticated users
      allow write: if request.auth != null;
    }
  }
}
```

After pasting these rules, click **Publish**. The changes may take a minute to take effect. Your file uploads should now work correctly.

### Firestore Rules

Your Firestore rules (located in Firebase Console -> Firestore Database -> Rules) control access to your database. The current rules are set up correctly to allow admins to manage content and users to manage their own data. No changes are needed here to fix the upload issue.
