# AC-Solution Firebase Project

## ⚠️ Important: How to Fix File Upload Errors

If you are seeing errors like **"Permission Denied"** or **`storage/unknown`** when uploading images in the admin panel, the problem is with your **Firebase Storage configuration**, not the application code.

The `storage/unknown` error is almost always a **CORS issue**. Please follow these two steps carefully.

### Step 1: Update Firebase Storage Security Rules

1.  Navigate to your **Firebase Console -> Storage -> Rules** tab.
2.  Replace the existing rules with the following to allow authenticated users to upload files:
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
3.  Click **Publish**. The changes may take a minute to take effect.

### Step 2: Configure Storage CORS (Crucial for `storage/unknown` Error)

This step is essential for fixing the `storage/unknown` error. It allows your website to communicate with your storage bucket.

1.  **Install Google Cloud SDK:** You will need the `gsutil` command-line tool. If you don't have it, follow the [Google Cloud SDK installation guide](https://cloud.google.com/sdk/docs/install). After installation, run `gcloud auth login` to authenticate.

2.  **Create `cors.json` file:** Create a file named `cors.json` on your computer with this exact content:
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
    > **Note:** For production, you should replace `"*"` with your app's domain (e.g., `https://your-app-name.web.app`).

3.  **Find Your Bucket URL:** Find your Storage bucket URL in the **Firebase Console -> Storage -> Files tab**. It looks like `gs://your-project-id.appspot.com`.

4.  **Run the `gsutil` Command:** Open your terminal, navigate to where you saved `cors.json`, and run the following command, replacing `YOUR_BUCKET_URL` with your actual bucket URL:
    ```bash
    gsutil cors set cors.json YOUR_BUCKET_URL
    ```
    *Example: `gsutil cors set cors.json gs://classic-solution-d7a01.appspot.com`*

After completing both steps, your file uploads should work correctly.

---

### Project Overview

This is a Next.js application for AC sales and services, using Firestore for data and Firebase Storage for file uploads.

### Firestore Rules

Your Firestore rules (located in `firestore.rules`) control access to your database. The current rules are set up correctly for the application's features and do not need to be changed to fix the upload issue.
