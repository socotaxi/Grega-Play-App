import React, { useState } from 'react';
import supabase from '../lib/supabaseClient';

const UploadTest = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("📂 Sélectionne un fichier d'abord.");
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `test-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error("Erreur Supabase:", error);
      setMessage("❌ Upload échoué : " + error.message);
    } else {
      const publicUrl = supabase
        .storage
        .from("avatars")
        .getPublicUrl(filePath).data.publicUrl;
      setMessage("✅ Upload réussi ! URL : " + publicUrl);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      <h2 className="text-2xl font-bold mb-4">Test Upload Supabase</h2>
      <input type="file" accept="image/*" onChange={handleChange} className="mb-4" />
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Upload
      </button>
      {message && (
        <div className="mt-4 p-3 rounded text-sm bg-gray-100 border">{message}</div>
      )}
    </div>
  );
};

export default UploadTest;