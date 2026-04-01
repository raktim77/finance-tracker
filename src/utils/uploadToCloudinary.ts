export const uploadToCloudinary = async (file: Blob) => {
  const formData = new FormData();
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  formData.append("file", file);
  formData.append("upload_preset", "xpensio_unsigned");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();

  if (!res.ok) throw new Error("Upload failed");

  return data.secure_url;
};
