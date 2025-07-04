# AC-Solution Firebase Project

This is a Next.js application for AC sales and services.

## Important Firebase Configuration

### Firestore vs. Firebase Storage

This project uses two key Firebase services:

1.  **Cloud Firestore:** A database for storing structured data like product details, user information, and appointments.
2.  **Cloud Storage:** A service for storing files like images, videos, and other user-generated content.

These two services have **separate security rules** that must be configured independently in the Firebase Console.

### Fixing File Upload Errors

If you encounter "Permission Denied" or "Unknown" errors when uploading images in the admin panel, it is almost always an issue with your Firebase Storage configuration. Please follow these two steps.

#### Step 1: Update Storage Security Rules

Navigate to your **Firebase Console -> Storage -> Rules** tab and update the rules to the following to allow authenticated users to upload files:

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
After pasting these rules, click **Publish**. The changes may take a minute to take effect.

#### Step 2: Configure Storage CORS (Very Important for 'Unknown' Error)

The `storage/unknown` error is often caused by missing CORS configuration, which allows your website to talk to your storage bucket.

1.  You will need the `gsutil` command-line tool. If you don't have it, follow the [Google Cloud SDK installation guide](https://cloud.google.com/sdk/docs/install).
2.  Create a file named `cors.json` on your computer with the following content:
    ```json
    [
      {
        "origin": ["*"],
        "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
        "responseHeader": [
          "Content-Type",
          "Access-Control-Allow-Origin"
        ],
        "maxAgeSeconds": 3600
      }
    ]
    ```
    *Note: Using `"*"` for origin is convenient for development but for production, you should replace it with your app's domain (e.g., `https://your-app-name.web.app`).*
3.  Find your Storage bucket URL in the **Firebase Console -> Storage**. It will look like `gs://your-project-id.appspot.com`.
4.  Run the following command in your terminal, replacing `YOUR_BUCKET_URL` with your actual bucket URL:
    ```bash
    gsutil cors set cors.json YOUR_BUCKET_URL
    ```
    Example: `gsutil cors set cors.json gs://classic-solution-d7a01.appspot.com`

After completing both steps, your file uploads should work correctly.

### Firestore Rules

Your Firestore rules (located in Firebase Console -> Firestore Database -> Rules) control access to your database. The current rules are set up correctly to allow admins to manage content and users to manage their own data. No changes are needed here to fix the upload issue.
