const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} = require("firebase/firestore");

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
const database = getFirestore(firebaseApp);

module.exports = async (req, res) => {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the dynamic parameter from the URL
    const { folderName } = req.query;

    if (!folderName) {
      return res.status(400).json({ error: "Folder name is required" });
    }

    // Decode the URL-encoded folder name (e.g., "Capital%20A" becomes "Capital A")
    const decodedFolderName = decodeURIComponent(folderName);

    const q = query(
      collection(database, "files"),
      where("folderName", "==", decodedFolderName)
    );
    const querySnapshot = await getDocs(q);

    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push(doc.data());
    });

    res.json({ success: true, documents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};