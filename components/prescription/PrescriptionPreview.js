"use client";

import { useRef, forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getDoctorProfile } from "@/app/actions";

export const PrescriptionPreview = forwardRef(({ patient, diagnosis, medicines, advice, date, showDownloadButton = false, patientContact }, ref) => {
  const prescriptionRef = useRef(null);
  const [doctorProfile, setDoctorProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await getDoctorProfile();
      setDoctorProfile(profile);
    };
    fetchProfile();
  }, []);

  useImperativeHandle(ref, () => ({
    download: handleDownload
  }));

  const generatePDF = async () => {
    if (!prescriptionRef.current) {
      console.error("Prescription ref is missing");
      return null;
    }

    try {
      console.log("Starting PDF generation...");
      
      // Clone the element to ensure it's visible for capture
      const originalElement = prescriptionRef.current;
      const clone = originalElement.cloneNode(true);
      
      // Style the clone to be visible but off-screen
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '800px';
      clone.style.display = 'block';
      clone.style.zIndex = '-1';
      
      document.body.appendChild(clone);
      
      // Wait a bit for the clone to render
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(clone, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: 800,
      });
      
      document.body.removeChild(clone);
      
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      
      if (imgData.length < 100) {
        throw new Error("Image data is too short, likely empty or tainted canvas.");
      }
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      return pdf;
    } catch (error) {
      console.error("Error generating PDF:", error);
      return null;
    }
  };

  const handleDownload = async () => {
    const pdf = await generatePDF();
    if (pdf) {
      pdf.save(`Prescription_${patient.name || "Patient"}.pdf`);
      console.log("PDF saved");
    } else {
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handleSendWhatsApp = async () => {
    if (!patientContact) {
      alert("Patient contact number is not available.");
      return;
    }

    try {
      // 1. Generate PDF Blob
      const pdf = await generatePDF();
      if (!pdf) {
        alert("Failed to generate PDF for sharing.");
        return;
      }
      
      const pdfBlob = pdf.output('blob');
      // Sanitize filename: replace spaces with underscores to ensure valid URLs
      const safeName = (patient.name || "Patient").replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `Prescription_${safeName}_${Date.now()}.pdf`;

      // 2. Upload to Cloudinary
      // Dynamically import to avoid server-side issues if any, though this is a client component
      const { uploadPDFToCloudinary } = await import("@/lib/cloudinary-upload");
      
      // Show loading state (optional: could add a toast here)
      const uploadButton = document.getElementById('whatsapp-btn');
      if (uploadButton) uploadButton.innerText = "Uploading...";

      const uploadResult = await uploadPDFToCloudinary(pdfBlob, fileName);
      
      if (uploadButton) uploadButton.innerText = "Send WhatsApp";

      if (!uploadResult.success) {
        console.error("Upload failed:", uploadResult.error);
        alert(`Failed to upload prescription: ${uploadResult.error}\n\nPlease check your Cloudinary configuration.`);
        return;
      }

      // 3. Prepare WhatsApp Message
      const cleanNumber = patientContact.replace(/\D/g, '');
      const fileUrl = uploadResult.url;
      console.log("Cloudinary URL:", fileUrl); // Debugging log
      
      const message = `Hello ${patient.name || "Patient"},

Your prescription from ${doctorProfile?.clinicName || "our clinic"} is ready.

📋 Diagnosis: ${diagnosis || "N/A"}
📅 Date: ${date}

🔗 View/Download Prescription:
${fileUrl}

(Link valid for 30 days)

Best regards,
${doctorProfile?.name || "Doctor"}`;
      
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
      
      // 4. Open WhatsApp
      window.open(whatsappUrl, '_blank');
      
    } catch (error) {
      console.error("Error sending to WhatsApp:", error);
      alert("Failed to process request. Please try again.");
      const uploadButton = document.getElementById('whatsapp-btn');
      if (uploadButton) uploadButton.innerText = "Send WhatsApp";
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gray-50 border-b border-gray-100 rounded-t-xl flex flex-row items-center justify-between">
          <CardTitle className="text-gray-700 flex items-center gap-2">
            <FileText className="h-5 w-5" /> Prescription Preview
          </CardTitle>
          {showDownloadButton && (
            <div className="flex gap-2">
              {patientContact && (
                <Button id="whatsapp-btn" variant="outline" size="sm" onClick={handleSendWhatsApp} className="text-green-600 border-green-200 hover:bg-green-50">
                  <Send className="h-4 w-4 mr-2" /> Send WhatsApp
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleDownload} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                <Download className="h-4 w-4 mr-2" /> Download PDF
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-8 bg-white min-h-[600px]">
          <div 
            ref={prescriptionRef} 
            className="w-full bg-white p-8"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Header */}
            <div style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                  {doctorProfile?.name || "Doctor Name"}
                </h1>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  {doctorProfile?.qualifications || "MBBS, MD (General Medicine)"}
                </p>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Reg No: {doctorProfile?.registrationNumber || "12345678"}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                {doctorProfile?.logoUrl && (
                  <img src={doctorProfile.logoUrl} alt="Clinic Logo" style={{ height: '50px', marginBottom: '8px', marginLeft: 'auto' }} />
                )}
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb', marginBottom: '4px' }}>
                  {doctorProfile?.clinicName || "MediPrescribe Clinic"}
                </h2>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  {doctorProfile?.clinicAddress || "123 Health Avenue, Medical District"}
                </p>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Phone: {doctorProfile?.clinicPhone || "+1 234 567 890"}
                </p>
              </div>
            </div>

            {/* Patient Info */}
            <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#374151' }}><span style={{ fontWeight: '600' }}>Patient Name:</span> {patient.name || "—"}</p>
                <p style={{ fontSize: '14px', color: '#374151', marginTop: '4px' }}><span style={{ fontWeight: '600' }}>Age/Gender:</span> {patient.age ? `${patient.age} Yrs` : "—"} / {patient.gender || "—"}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '14px', color: '#374151' }}><span style={{ fontWeight: '600' }}>Date:</span> {date}</p>
                <p style={{ fontSize: '14px', color: '#374151', marginTop: '4px' }}><span style={{ fontWeight: '600' }}>Diagnosis:</span> {diagnosis || "—"}</p>
              </div>
            </div>

            {/* Medicines */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>Prescribed Medicines</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Medicine</th>
                    <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Dosage</th>
                    <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Frequency</th>
                    <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((med, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 8px', fontSize: '14px', fontWeight: '500', color: '#111827' }}>{med.name || "—"}</td>
                      <td style={{ padding: '12px 8px', fontSize: '14px', color: '#374151' }}>{med.dosage || "—"}</td>
                      <td style={{ padding: '12px 8px', fontSize: '14px', color: '#374151' }}>{med.frequency || "—"}</td>
                      <td style={{ padding: '12px 8px', fontSize: '14px', color: '#374151' }}>{med.duration || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Advice */}
            {advice && (
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Advice</h3>
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>{advice}</p>
              </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                <p>Generated by MediPrescribe</p>
                <p>{date}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '40px', marginBottom: '8px' }}>
                  {doctorProfile?.signatureUrl && (
                    <img src={doctorProfile.signatureUrl} alt="Signature" style={{ height: '100%', maxWidth: '150px' }} />
                  )}
                </div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', borderTop: '1px solid #e5e7eb', paddingTop: '8px', paddingLeft: '24px', paddingRight: '24px' }}>Doctor&apsos;s Signature</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

PrescriptionPreview.displayName = "PrescriptionPreview";
