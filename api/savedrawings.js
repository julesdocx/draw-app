const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  addDoc,
} = require("firebase/firestore");
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require("firebase/storage");

const config = {
  apiKey: "AIzaSyDlcem2X9UbFxE20qozxvn1pBftoNbtJ2g",
  authDomain: "development-v-321909.firebaseapp.com",
  projectId: "development-v-321909",
  storageBucket: "development-v-321909.appspot.com",
  messagingSenderId: "751787708018",
  appId: "1:751787708018:web:46d2c272227bebba173ceb",
};

// Initialize Firebase
const firebaseApp = initializeApp(config);
const storage = getStorage(firebaseApp);
const database = getFirestore(firebaseApp);

// Helper function to add files to database
const addFiles = async (imageLink, imageName, folderName) => {
  try {
    const files = collection(database, "files");
    await addDoc(files, {
      imageLink: imageLink,
      imageName: imageName,
      folderName: folderName,
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = async (req, res) => {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, topic } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image data is required." });
    }

    // Convert base64 data to a buffer
    const buffer = Buffer.from(image, "base64");
    const timestamp = Date.now();
    const fileName = `images/${timestamp}.png`;

    // Create a reference to the storage path
    const storageRef = ref(storage, fileName);

    // Upload the file
    const uploadTask = uploadBytesResumable(storageRef, buffer);

    // Wait for the upload to complete
    const snapshot = await uploadTask;

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Add to database
    await addFiles(downloadURL, fileName, topic);

    res.status(200).json({ downloadURL });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};