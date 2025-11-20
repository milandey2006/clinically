/**
 * Upload PDF to Cloudinary
 * Uses unsigned upload for direct browser uploads
 */

export async function uploadPDFToCloudinary(pdfBlob, fileName) {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary configuration missing. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your .env.local file.");
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', pdfBlob, fileName);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'prescriptions');
    formData.append('tags', 'expiry_30_days'); // Tag for auto-deletion rule

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload failed: ${error}`);
    }

    const data = await response.json();
    
    // Return the secure URL
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
